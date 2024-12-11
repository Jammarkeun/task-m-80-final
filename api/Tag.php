<?php
class Tag {
    private $conn;
    private $table_name = "tags";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function addTags($task_id, $tags) {
        $success = true;
        $this->conn->begin_transaction();

        try {
            $query = "INSERT INTO {$this->table_name} (task_id, name) VALUES (?, ?)";
            $stmt = $this->conn->prepare($query);

            foreach ($tags as $tag) {
                $stmt->bind_param("is", $task_id, $tag);
                if (!$stmt->execute()) {
                    throw new Exception("Failed to add tag: " . $tag);
                }
            }

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollback();
            error_log($e->getMessage());
            return false;
        }
    }
}
