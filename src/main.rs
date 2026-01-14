mod admin;
mod admin_ui;
mod anthropic;
mod common;
mod http_client;
mod kiro;
mod model;
pub mod token;

use std::sync::Arc;

use clap::Parser;
use common::settings::{SettingsData, SettingsManager};
use kiro::model::credentials::{CredentialsConfig, KiroCredentials};
use kiro::provider::KiroProvider;
use kiro::token_manager::MultiTokenManager;
use model::arg::Args;
use model::config::Config;

#[tokio::main]
async fn main() {
    // 解析命令行参数
    let args = Args::parse();

    // 初始化日志
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive(tracing::Level::INFO.into()),
        )
        .init();

    // 加载配置
    let config_path = args
        .config
        .unwrap_or_else(|| Config::default_config_path().to_string());
    let config = Config::load(&config_path).unwrap_or_else(|e| {
        tracing::error!("加载配置失败: {}", e);
        std::process::exit(1);
    });

    // 加载凭证（支持单对象或数组格式）
    let credentials_path = args
        .credentials
        .unwrap_or_else(|| KiroCredentials::default_credentials_path().to_string());
    let credentials_config = CredentialsConfig::load(&credentials_path).unwrap_or_else(|e| {
        tracing::error!("加载凭证失败: {}", e);
        std::process::exit(1);
    });

    // 判断是否为多凭据格式（用于刷新后回写）
    let is_multiple_format = credentials_config.is_multiple();

    // 转换为按优先级排序的凭据列表
    let credentials_list = credentials_config.into_sorted_credentials();
    tracing::info!("已加载 {} 个凭据配置", credentials_list.len());

    // 获取第一个凭据用于日志显示
    let first_credentials = credentials_list.first().cloned().unwrap_or_default();
    tracing::debug!("主凭证: {:?}", first_credentials);

    // 初始化动态设置管理器
    let settings_path = args
        .settings
        .unwrap_or_else(|| SettingsManager::default_settings_path().to_string());
    let settings_defaults = SettingsData {
        admin_api_key: config.admin_api_key.clone(),
        api_key: config.api_key.clone(),
    };
    let settings_manager = SettingsManager::initialize(&settings_path, settings_defaults)
        .unwrap_or_else(|e| {
            tracing::error!("初始化 settings 失败: {}", e);
            std::process::exit(1);
        });
    let settings_manager = Arc::new(settings_manager);
    if args.reset_admin_key {
        match settings_manager.clear_admin_key() {
            Ok(_) => {
                tracing::warn!("Admin key 已通过 CLI 强制清空，首次访问 /admin 将要求重新设置")
            }
            Err(e) => tracing::error!("清空 Admin key 失败: {}", e),
        }
    }

    if args.reset_api_key {
        match settings_manager.clear_api_key() {
            Ok(_) => tracing::warn!("API Key 已通过 CLI 清空，需在 Admin UI 中重新设置"),
            Err(e) => tracing::error!("清空 API Key 失败: {}", e),
        }
    }

    let api_key_handle = settings_manager.api_key_handle();
    let admin_key_handle = settings_manager.admin_key_handle();

    // 构建代理配置
    let proxy_config = config.proxy_url.as_ref().map(|url| {
        let mut proxy = http_client::ProxyConfig::new(url);
        if let (Some(username), Some(password)) = (&config.proxy_username, &config.proxy_password) {
            proxy = proxy.with_auth(username, password);
        }
        proxy
    });

    if proxy_config.is_some() {
        tracing::info!("已配置 HTTP 代理: {}", config.proxy_url.as_ref().unwrap());
    }

    // 创建 MultiTokenManager 和 KiroProvider
    let token_manager = MultiTokenManager::new(
        config.clone(),
        credentials_list,
        proxy_config.clone(),
        Some(credentials_path.into()),
        is_multiple_format,
    )
    .unwrap_or_else(|e| {
        tracing::error!("创建 Token 管理器失败: {}", e);
        std::process::exit(1);
    });
    let token_manager = Arc::new(token_manager);
    let kiro_provider = KiroProvider::with_proxy(token_manager.clone(), proxy_config.clone());

    // 初始化 count_tokens 配置
    token::init_config(token::CountTokensConfig {
        api_url: config.count_tokens_api_url.clone(),
        api_key: config.count_tokens_api_key.clone(),
        auth_type: config.count_tokens_auth_type.clone(),
        proxy: proxy_config,
    });

    // 构建 Anthropic API 路由（从第一个凭据获取 profile_arn）
    let anthropic_app = anthropic::create_router_with_provider(
        api_key_handle.clone(),
        Some(kiro_provider),
        first_credentials.profile_arn.clone(),
    );

    // 构建 Admin API / UI 路由
    let admin_service = admin::AdminService::new(token_manager.clone());
    let admin_state = admin::AdminState::new(
        admin_key_handle.clone(),
        settings_manager.clone(),
        admin_service,
    );
    let admin_app = admin::create_admin_router(admin_state);
    let admin_ui_app = admin_ui::create_admin_ui_router();

    let app = anthropic_app
        .nest("/api/admin", admin_app)
        .nest("/admin", admin_ui_app);

    // 启动服务器
    let addr = format!("{}:{}", config.host, config.port);
    tracing::info!("启动 Anthropic API 端点: {}", addr);
    if settings_manager.is_api_key_configured() {
        tracing::info!("API Key 已配置，可在 settings.json 或 Admin UI 中更新");
    } else {
        tracing::warn!("未检测到 API Key，需要在 Admin UI 中设置后才能调用 /v1 接口");
    }
    tracing::info!("可用 API:");
    tracing::info!("  GET  /v1/models");
    tracing::info!("  POST /v1/messages");
    tracing::info!("  POST /v1/messages/count_tokens");
    tracing::info!("Admin API:");
    tracing::info!("  GET  /api/admin/credentials");
    tracing::info!("  POST /api/admin/credentials/:index/disabled");
    tracing::info!("  POST /api/admin/credentials/:index/priority");
    tracing::info!("  POST /api/admin/credentials/:index/reset");
    tracing::info!("  GET  /api/admin/credentials/:index/balance");
    tracing::info!("Admin 设置接口:");
    tracing::info!("  GET  /api/admin/settings");
    tracing::info!("Admin UI: /admin");

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
