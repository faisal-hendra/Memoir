use tauri::{Manager, WindowEvent};
use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create entries table",
        sql: "CREATE TABLE IF NOT EXISTS entries (
                 id INTEGER PRIMARY KEY,
                 date TEXT NOT NULL,
                 title TEXT,
                 content TEXT,
                 UNIQUE(id)
             )",
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:memoir.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            let window_clone = window.clone();
            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    #[cfg(target_os = "macos")]
                    api.prevent_close();
                    #[cfg(target_os = "macos")]
                    window_clone.hide().unwrap();
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
