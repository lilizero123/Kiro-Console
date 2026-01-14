use clap::Parser;

/// Anthropic <-> Kiro API 客户端
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
pub struct Args {
    /// 配置文件路径
    #[arg(short, long)]
    pub config: Option<String>,

    /// 凭证文件路径
    #[arg(long)]
    pub credentials: Option<String>,

    /// Settings 文件路径
    #[arg(long)]
    pub settings: Option<String>,

    /// 启动前强制清空管理员登录密钥（触发重新初始化）
    #[arg(long, default_value_t = false)]
    pub reset_admin_key: bool,

    /// 启动前强制清空 API Key（触发重新配置）
    #[arg(long, default_value_t = false)]
    pub reset_api_key: bool,
}
