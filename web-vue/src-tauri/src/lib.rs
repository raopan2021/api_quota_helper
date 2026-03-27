#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|_app| {
            env_logger::init();
            log::info!("API额度助手启动");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("启动Tauri应用时发生错误");
}
