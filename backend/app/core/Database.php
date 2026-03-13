<?php
namespace App\Core;

use PDO;
use PDOException;

/**
 * Database Class - Handles database connections and queries
 */
class Database
{
    private static $instance = null;
    private $connection;
    private $config;
    
    private function __construct()
    {
        $this->config = require APP_PATH . '/config/config.php';
        $this->connect();
    }
    
    /**
     * Get database instance (Singleton)
     */
    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        
        return self::$instance;
    }
    
    /**
     * Connect to database
     */
    private function connect()
    {
        try {
            $dbConfig = $this->config['database'];
            
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                $dbConfig['host'],
                $dbConfig['port'],
                $dbConfig['name'],
                $dbConfig['charset']
            );
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->connection = new PDO(
                $dsn,
                $dbConfig['user'],
                $dbConfig['pass'],
                $options
            );
            
        } catch (PDOException $e) {
            throw new \Exception('Database connection failed: ' . $e->getMessage());
        }
    }
    
    /**
     * Get PDO connection
     */
    public function getConnection()
    {
        return $this->connection;
    }
    
    /**
     * Execute query
     */
    public function query($sql, $params = [])
    {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            throw new \Exception('Query failed: ' . $e->getMessage());
        }
    }
    
    /**
     * Fetch all results
     */
    public function fetchAll($sql, $params = [])
    {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }
    
    /**
     * Fetch single result
     */
    public function fetch($sql, $params = [])
    {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }
    
    /**
     * Execute statement
     */
    public function execute($sql, $params = [])
    {
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }
    
    /**
     * Get last insert ID
     */
    public function lastInsertId()
    {
        return $this->connection->lastInsertId();
    }
    
    /**
     * Begin transaction
     */
    public function beginTransaction()
    {
        return $this->connection->beginTransaction();
    }
    
    /**
     * Commit transaction
     */
    public function commit()
    {
        return $this->connection->commit();
    }
    
    /**
     * Rollback transaction
     */
    public function rollback()
    {
        return $this->connection->rollBack();
    }
}

