<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $fullname;
    public $email;
    public $password;
    public $timezone;
    public $profile_image;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (fullname, email, password) VALUES (:fullname, :email, :password)";
        $stmt = $this->conn->prepare($query);

        $this->fullname = htmlspecialchars(strip_tags($this->fullname));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $hashed_password = password_hash($this->password, PASSWORD_DEFAULT);

        $stmt->bindParam(":fullname", $this->fullname);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $hashed_password);

        return $stmt->execute();
    }

    public function getProfile() {
        $query = "SELECT fullname, email, timezone, profile_image FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(':id', $this->id);

        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->fullname = $row['fullname'];
            $this->email = $row['email'];
            $this->timezone = $row['timezone'];
            $this->profile_image = $row['profile_image'];
            return true;
        }
        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET fullname = :fullname, 
                      email = :email, 
                      timezone = :timezone 
                  WHERE id = :id";
    
        $stmt = $this->conn->prepare($query);
    
        // Sanitize input
        $this->fullname = htmlspecialchars(strip_tags($this->fullname));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->timezone = htmlspecialchars(strip_tags($this->timezone));
        $this->id = htmlspecialchars(strip_tags($this->id));
    
        // Bind parameters
        $stmt->bindParam(":fullname", $this->fullname);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":timezone", $this->timezone);
        $stmt->bindParam(":id", $this->id);
    
        return $stmt->execute();
    }

    public function updateProfileImage($image_url) {
        $query = "UPDATE " . $this->table_name . " SET profile_image = :profile_image WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->profile_image = htmlspecialchars(strip_tags($image_url));
        $stmt->bindParam(':profile_image', $this->profile_image);
        $stmt->bindParam(':id', $this->id);

        return $stmt->execute();
    }

    public function login() {
        $query = "SELECT id, fullname, password FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);

        $this->email = htmlspecialchars(strip_tags($this->email));
        $stmt->bindParam(':email', $this->email);

        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($this->password, $row['password'])) {
                $this->id = $row['id'];
                $this->fullname = $row['fullname'];
                return true;
            }
        }
        return false;
    }
}
