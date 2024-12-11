<?php
class UserPreferences {
    private $conn;
    private $table_name = "user_preferences";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function updatePreferences($user_id, $preferences) {
        $query = "INSERT INTO {$this->table_name} (user_id, email_notifications, theme, language) 
                 VALUES (?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                 email_notifications = VALUES(email_notifications),
                 theme = VALUES(theme),
                 language = VALUES(language)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("isss", 
            $user_id, 
            $preferences->email_notifications, 
            $preferences->theme, 
            $preferences->language
        );
        return $stmt->execute();
    }
}
