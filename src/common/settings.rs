//! 动态设置管理器
//!
//! 负责持久化和热更新管理员密钥、对外 API Key 等敏感配置。

use anyhow::{Context, Result, bail};
use parking_lot::{Mutex, RwLock};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;

/// `settings.json` 中存储的数据
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SettingsData {
    pub admin_api_key: Option<String>,
    pub api_key: Option<String>,
}

impl SettingsData {
    fn sanitize(mut self) -> Self {
        self.admin_api_key = normalize_opt(self.admin_api_key);
        self.api_key = normalize_opt(self.api_key);
        self
    }
}

fn normalize_opt(value: Option<String>) -> Option<String> {
    value.and_then(|v| {
        let trimmed = v.trim().to_string();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed)
        }
    })
}

struct SettingsInner {
    path: PathBuf,
    data: Mutex<SettingsData>,
    admin_key: Arc<RwLock<Option<String>>>,
    api_key: Arc<RwLock<Option<String>>>,
}

/// 运行期设置管理器
#[derive(Clone)]
pub struct SettingsManager {
    inner: Arc<SettingsInner>,
}

impl SettingsManager {
    /// 默认的 settings 路径
    pub fn default_settings_path() -> &'static str {
        "settings.json"
    }

    /// 初始化设置管理器，如果文件不存在会使用默认值创建。
    pub fn initialize(path: impl Into<PathBuf>, defaults: SettingsData) -> Result<Self> {
        let path = path.into();
        let initial_data = load_or_default(&path, defaults)?.sanitize();

        let manager = Self {
            inner: Arc::new(SettingsInner {
                path,
                admin_key: Arc::new(RwLock::new(initial_data.admin_api_key.clone())),
                api_key: Arc::new(RwLock::new(initial_data.api_key.clone())),
                data: Mutex::new(initial_data.clone()),
            }),
        };

        manager.persist_snapshot()?;
        Ok(manager)
    }

    /// 获得 admin key 的共享句柄
    pub fn admin_key_handle(&self) -> Arc<RwLock<Option<String>>> {
        self.inner.admin_key.clone()
    }

    /// 获得 API key 的共享句柄
    pub fn api_key_handle(&self) -> Arc<RwLock<Option<String>>> {
        self.inner.api_key.clone()
    }

    /// 当前设置快照
    pub fn snapshot(&self) -> SettingsData {
        self.inner.data.lock().clone()
    }

    /// 是否已经初始化管理员密钥
    pub fn is_admin_initialized(&self) -> bool {
        self.snapshot().admin_api_key.is_some()
    }

    /// API Key 是否就绪
    pub fn is_api_key_configured(&self) -> bool {
        self.snapshot().api_key.is_some()
    }

    /// 设置新的管理员密钥
    pub fn set_admin_key(&self, new_key: impl Into<String>) -> Result<()> {
        let normalized = normalize_required(new_key.into(), "管理员密钥")?;
        self.update(|data| {
            data.admin_api_key = Some(normalized.clone());
            Ok((Some(normalized), None))
        })?;
        Ok(())
    }

    /// 设置 API Key
    pub fn set_api_key(&self, new_key: impl Into<String>) -> Result<()> {
        let normalized = normalize_required(new_key.into(), "API Key")?;
        self.update(|data| {
            data.api_key = Some(normalized.clone());
            Ok((None, Some(normalized)))
        })?;
        Ok(())
    }

    /// 清空管理员密钥（用于 CLI 强制重置）
    pub fn clear_admin_key(&self) -> Result<()> {
        self.update(|data| {
            data.admin_api_key = None;
            Ok((Some(String::new()), None))
        })?;
        Ok(())
    }

    /// 清空 API Key（用于 CLI 强制重置）
    pub fn clear_api_key(&self) -> Result<()> {
        self.update(|data| {
            data.api_key = None;
            Ok((None, Some(String::new())))
        })?;
        Ok(())
    }

    /// 更新 settings 并在需要时刷新内存句柄
    fn update<F>(&self, mutate: F) -> Result<()>
    where
        F: FnOnce(&mut SettingsData) -> Result<(Option<String>, Option<String>)>,
    {
        let mut data = self.inner.data.lock();
        let (admin_update, api_update) = mutate(&mut data)?;
        let snapshot = data.clone();
        drop(data);
        self.persist(&snapshot)?;

        if let Some(value) = admin_update {
            let mut guard = self.inner.admin_key.write();
            *guard = if value.is_empty() { None } else { Some(value) };
        }
        if let Some(value) = api_update {
            let mut guard = self.inner.api_key.write();
            *guard = if value.is_empty() { None } else { Some(value) };
        }
        Ok(())
    }

    fn persist_snapshot(&self) -> Result<()> {
        let snapshot = self.inner.data.lock().clone();
        self.persist(&snapshot)
    }

    fn persist(&self, data: &SettingsData) -> Result<()> {
        let dir = self
            .inner
            .path
            .parent()
            .filter(|p| !p.as_os_str().is_empty());
        if let Some(parent) = dir {
            fs::create_dir_all(parent).context("创建 settings 目录失败")?;
        }

        let tmp_path = self.inner.path.with_extension("tmp");
        let payload = serde_json::to_vec_pretty(data)?;
        fs::write(&tmp_path, &payload).context("写入临时 settings 文件失败")?;
        if self.inner.path.exists() {
            fs::remove_file(&self.inner.path).ok();
        }
        fs::rename(&tmp_path, &self.inner.path).context("更新 settings 文件失败")?;
        Ok(())
    }
}

fn normalize_required(value: String, field: &str) -> Result<String> {
    let trimmed = value.trim().to_string();
    if trimmed.is_empty() {
        bail!("{field}不能为空");
    }
    Ok(trimmed)
}

fn load_or_default(path: &Path, defaults: SettingsData) -> Result<SettingsData> {
    if path.exists() {
        let text = fs::read_to_string(path)
            .with_context(|| format!("读取 settings 文件失败: {}", path.to_string_lossy()))?;
        let data: SettingsData = serde_json::from_str(&text)
            .with_context(|| format!("解析 settings 文件失败: {}", path.to_string_lossy()))?;
        Ok(data)
    } else {
        Ok(defaults)
    }
}
