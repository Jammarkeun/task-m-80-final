<?php
class Task {
    private $conn;
    private $table_name = "tasks";

    public $id;
    public $user_id;
    public $title;
    public $description;
    public $status;
    public $due_date;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE user_id = ? ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->user_id);
        $stmt->execute();
        return $stmt;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " SET title=:title, description=:description, user_id=:user_id, status=:status, due_date=:due_date";
        $stmt = $this->conn->prepare($query);

        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $this->status = htmlspecialchars(strip_tags($this->status));

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":due_date", $this->due_date);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . " SET title = :title, description = :description, due_date = :due_date, status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
    
        // Sanitize inputs
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->due_date = htmlspecialchars(strip_tags($this->due_date));
        $this->status = htmlspecialchars(strip_tags($this->status)); // Ensure 'status' is set correctly
        $this->id = htmlspecialchars(strip_tags($this->id));
    
        // Bind parameters
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':due_date', $this->due_date);
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':id', $this->id);
    
        if ($stmt->execute()) {
            return true;
        }
        return false;
    }
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(1, $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function getTaskTrends() {
        $query = "SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as new_tasks,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
                  FROM " . $this->table_name . "
                  WHERE user_id = ? 
                    AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                  GROUP BY DATE(created_at)
                  ORDER BY DATE(created_at)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->user_id);
        $stmt->execute();
        
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $trends = [
            'dates' => [],
            'new' => [],
            'completed' => []
        ];
        
        foreach ($result as $row) {
            $trends['dates'][] = $row['date'];
            $trends['new'][] = $row['new_tasks'];
            $trends['completed'][] = $row['completed_tasks'];
        }
        
        return $trends;
    }

    public function getCompletedTasks() {
        $query = "SELECT * FROM " . $this->table_name . "
                  WHERE user_id = ? AND status = 'completed'
                  ORDER BY completed_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->user_id);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOverdueTasks() {
        $query = "SELECT * FROM " . $this->table_name . "
                  WHERE user_id = ? AND status != 'completed' AND due_date < CURDATE()
                  ORDER BY due_date ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->user_id);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    

    public function getWeeklySummary() {
        $query = "SELECT 
                    COUNT(*) as total_tasks,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                    SUM(CASE WHEN status != 'completed' AND due_date < CURDATE() THEN 1 ELSE 0 END) as overdue_tasks,
                    SUM(CASE WHEN status != 'completed' AND due_date >= CURDATE() THEN 1 ELSE 0 END) as upcoming_tasks
                  FROM " . $this->table_name . "
                  WHERE user_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->user_id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}