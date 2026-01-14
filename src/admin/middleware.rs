//! Admin API 中间件

use std::sync::Arc;

use axum::{
    body::Body,
    extract::State,
    http::{Request, StatusCode},
    middleware::Next,
    response::{IntoResponse, Json, Response},
};
use parking_lot::RwLock;

use super::service::AdminService;
use super::types::AdminErrorResponse;
use crate::common::{auth, settings::SettingsManager};

/// Admin API 共享状态
#[derive(Clone)]
pub struct AdminState {
    /// Admin API 密钥
    pub admin_api_key: Arc<RwLock<Option<String>>>,
    /// Admin 服务
    pub service: Arc<AdminService>,
    /// 动态设置管理器
    pub settings: Arc<SettingsManager>,
}

impl AdminState {
    pub fn new(
        admin_api_key: Arc<RwLock<Option<String>>>,
        settings: Arc<SettingsManager>,
        service: AdminService,
    ) -> Self {
        Self {
            admin_api_key,
            service: Arc::new(service),
            settings,
        }
    }
}

/// Admin API 认证中间件
pub async fn admin_auth_middleware(
    State(state): State<AdminState>,
    request: Request<Body>,
    next: Next,
) -> Response {
    let stored_key = state.admin_api_key.read().clone();
    if stored_key.is_none() {
        let error = AdminErrorResponse::not_initialized("Admin key is not configured yet");
        return (StatusCode::FORBIDDEN, Json(error)).into_response();
    }

    let incoming = auth::extract_api_key(&request);
    match (stored_key, incoming) {
        (Some(expected), Some(provided)) if auth::constant_time_eq(&provided, &expected) => {
            next.run(request).await
        }
        _ => {
            let error = AdminErrorResponse::authentication_error();
            (StatusCode::UNAUTHORIZED, Json(error)).into_response()
        }
    }
}
