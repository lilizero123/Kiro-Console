//! Admin API HTTP 处理器

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};

use super::{
    middleware::AdminState,
    types::AdminErrorResponse,
    types::{
        AddCredentialRequest, AdminSettingsResponse, BatchAddCredentialRequest, InitAdminRequest,
        SetDisabledRequest, SetPriorityRequest, SetupStatusResponse, SuccessResponse,
        UpdateAdminKeyRequest, UpdateApiKeyRequest,
    },
};

/// GET /api/admin/credentials
/// 获取所有凭据状态
pub async fn get_all_credentials(State(state): State<AdminState>) -> impl IntoResponse {
    let response = state.service.get_all_credentials();
    Json(response)
}

/// POST /api/admin/credentials/:id/disabled
/// 设置凭据禁用状态
pub async fn set_credential_disabled(
    State(state): State<AdminState>,
    Path(id): Path<u64>,
    Json(payload): Json<SetDisabledRequest>,
) -> impl IntoResponse {
    match state.service.set_disabled(id, payload.disabled) {
        Ok(_) => {
            let action = if payload.disabled { "禁用" } else { "启用" };
            Json(SuccessResponse::new(format!("凭据 #{} 已{}", id, action))).into_response()
        }
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// POST /api/admin/credentials/:id/priority
/// 设置凭据优先级
pub async fn set_credential_priority(
    State(state): State<AdminState>,
    Path(id): Path<u64>,
    Json(payload): Json<SetPriorityRequest>,
) -> impl IntoResponse {
    match state.service.set_priority(id, payload.priority) {
        Ok(_) => Json(SuccessResponse::new(format!(
            "凭据 #{} 优先级已设置为 {}",
            id, payload.priority
        )))
        .into_response(),
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// POST /api/admin/credentials/:id/reset
/// 重置失败计数并重新启用
pub async fn reset_failure_count(
    State(state): State<AdminState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.service.reset_and_enable(id) {
        Ok(_) => Json(SuccessResponse::new(format!(
            "凭据 #{} 失败计数已重置并重新启用",
            id
        )))
        .into_response(),
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// GET /api/admin/credentials/:id/balance
/// 获取指定凭据的余额
pub async fn get_credential_balance(
    State(state): State<AdminState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.service.get_balance(id).await {
        Ok(response) => Json(response).into_response(),
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// POST /api/admin/credentials
/// 添加新凭据
pub async fn add_credential(
    State(state): State<AdminState>,
    Json(payload): Json<AddCredentialRequest>,
) -> impl IntoResponse {
    match state.service.add_credential(payload).await {
        Ok(response) => Json(response).into_response(),
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// POST /api/admin/credentials/batch
/// 批量添加凭据
pub async fn add_credentials_batch(
    State(state): State<AdminState>,
    Json(payload): Json<BatchAddCredentialRequest>,
) -> impl IntoResponse {
    let response = state.service.add_credentials_batch(payload).await;
    Json(response)
}

/// DELETE /api/admin/credentials/:id
/// 删除凭据
pub async fn delete_credential(
    State(state): State<AdminState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.service.delete_credential(id) {
        Ok(_) => Json(SuccessResponse::new(format!("凭据 #{} 已删除", id))).into_response(),
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// GET /api/admin/setup/status
pub async fn get_setup_status(State(state): State<AdminState>) -> impl IntoResponse {
    let snapshot = state.settings.snapshot();
    Json(SetupStatusResponse {
        initialized: snapshot.admin_api_key.is_some(),
        api_key_configured: snapshot.api_key.is_some(),
    })
}

/// POST /api/admin/setup/init
pub async fn initialize_admin(
    State(state): State<AdminState>,
    Json(payload): Json<InitAdminRequest>,
) -> impl IntoResponse {
    if state.settings.is_admin_initialized() {
        let err = AdminErrorResponse::conflict("Admin key already configured");
        return (StatusCode::CONFLICT, Json(err)).into_response();
    }

    if payload.admin_api_key.trim().is_empty() {
        let err = AdminErrorResponse::invalid_request("管理员密钥不能为空");
        return (StatusCode::BAD_REQUEST, Json(err)).into_response();
    }

    if let Err(e) = state.settings.set_admin_key(payload.admin_api_key) {
        tracing::error!("初始化管理员密钥失败: {}", e);
        let err = AdminErrorResponse::internal_error("保存管理员密钥失败");
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(err)).into_response();
    }

    if let Some(api_key) = payload.api_key.and_then(|v| {
        let trimmed = v.trim().to_string();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed)
        }
    }) {
        if let Err(e) = state.settings.set_api_key(api_key) {
            tracing::error!("设置 API Key 失败: {}", e);
            let err = AdminErrorResponse::internal_error("保存 API Key 失败");
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(err)).into_response();
        }
    }

    Json(SuccessResponse::new("初始化成功")).into_response()
}

/// GET /api/admin/settings
pub async fn get_admin_settings(State(state): State<AdminState>) -> impl IntoResponse {
    let snapshot = state.settings.snapshot();
    let preview = snapshot.api_key.as_deref().map(mask_api_key);
    Json(AdminSettingsResponse {
        admin_initialized: snapshot.admin_api_key.is_some(),
        api_key_configured: snapshot.api_key.is_some(),
        api_key_preview: preview,
    })
}

/// POST /api/admin/settings/api-key
pub async fn update_api_key(
    State(state): State<AdminState>,
    Json(payload): Json<UpdateApiKeyRequest>,
) -> impl IntoResponse {
    if payload.api_key.trim().is_empty() {
        let err = AdminErrorResponse::invalid_request("API Key 不能为空");
        return (StatusCode::BAD_REQUEST, Json(err)).into_response();
    }

    if let Err(e) = state.settings.set_api_key(payload.api_key) {
        tracing::error!("更新 API Key 失败: {}", e);
        let err = AdminErrorResponse::internal_error("更新 API Key 失败");
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(err)).into_response();
    }

    Json(SuccessResponse::new("API Key 已更新")).into_response()
}

/// POST /api/admin/settings/admin-key
pub async fn update_admin_key(
    State(state): State<AdminState>,
    Json(payload): Json<UpdateAdminKeyRequest>,
) -> impl IntoResponse {
    if payload.admin_api_key.trim().is_empty() {
        let err = AdminErrorResponse::invalid_request("管理员密钥不能为空");
        return (StatusCode::BAD_REQUEST, Json(err)).into_response();
    }

    if let Err(e) = state.settings.set_admin_key(payload.admin_api_key) {
        tracing::error!("更新管理员密钥失败: {}", e);
        let err = AdminErrorResponse::internal_error("更新管理员密钥失败");
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(err)).into_response();
    }

    Json(SuccessResponse::new("管理员密钥已更新")).into_response()
}

fn mask_api_key(value: &str) -> String {
    if value.len() <= 8 {
        "*".repeat(value.len())
    } else {
        format!("{}***{}", &value[..4], &value[value.len() - 4..])
    }
}
