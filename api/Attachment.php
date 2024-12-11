<?php
class Attachment {
    private $conn;
    private $table_name = "attachments";
    private $upload_path = "./uploads/";

    public function __construct($db) {
        $this->conn = $db;
        if (!file_exists($this->upload_path)) {
            mkdir($this->upload_path, 0777, true);
        }
    }

    public function upload($task_id, $file) {
        $file_name = time() . '_' . basename($file['name']);
        $file_path = $this->upload_path . $file_name;

        if (move_uploaded_file($file['tmp_name'], $file_path)) {
            $query = "INSERT INTO {$this->table_name} (task_id, file_name, file_path) VALUES (?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("iss", $task_id, $file_name, $file_path);
            return $stmt->execute();
        }
        return false;
    }
}
