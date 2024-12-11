<?php
class Statistics {
    private $conn;
    private $table_name = "tasks";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getTaskStatistics($user_id) {
        $query = "SELECT 
                 COUNT(*) as total_tasks,
                 SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                 SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
                 SUM(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 ELSE 0 END) as overdue_tasks
                 FROM {$this->table_name} 
                 WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }
}
