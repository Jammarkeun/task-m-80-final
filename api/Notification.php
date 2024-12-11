<?php
class NotificationSystem {
    private $conn;
    private $table_name = "notifications";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function createNotification($user_id, $type, $message) {
        $query = "INSERT INTO {$this->table_name} (user_id, type, message) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("iss", $user_id, $type, $message);
        return $stmt->execute();
    }

    public function getNotifications($user_id) {
        $query = "SELECT * FROM {$this->table_name} WHERE user_id = ? ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }
}
