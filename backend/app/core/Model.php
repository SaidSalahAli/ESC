<?php
namespace App\Core;

/**
 * Base Model Class
 */
abstract class Model
{
    protected $db;
    protected $table;
    protected $primaryKey = 'id';
    protected $fillable = [];
    protected $hidden = [];
    
    public function __construct()
    {
        $this->db = Database::getInstance();
    }
    
    /**
     * Find record by ID
     */
    public function find($id)
    {
        $sql = "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ? LIMIT 1";
        $result = $this->db->fetch($sql, [$id]);
        
        if ($result) {
            return $this->hideFields($result);
        }
        
        return null;
    }
    
    /**
     * Find all records
     */
    public function all($limit = null, $offset = 0)
    {
        $sql = "SELECT * FROM {$this->table}";
        
        if ($limit) {
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }
        
        $results = $this->db->fetchAll($sql);
        
        return array_map([$this, 'hideFields'], $results);
    }
    
    /**
     * Find by condition
     */
    public function findBy($column, $value)
    {
        $sql = "SELECT * FROM {$this->table} WHERE {$column} = ?";
        $results = $this->db->fetchAll($sql, [$value]);
        
        return array_map([$this, 'hideFields'], $results);
    }
    
    /**
     * Find one by condition
     */
    public function findOneBy($column, $value)
    {
        $sql = "SELECT * FROM {$this->table} WHERE {$column} = ? LIMIT 1";
        $result = $this->db->fetch($sql, [$value]);
        
        if ($result) {
            return $this->hideFields($result);
        }
        
        return null;
    }
    
    /**
     * Create new record
     */
    public function create($data)
    {
        // Filter only fillable fields
        $data = $this->filterFillable($data);
        
        if (empty($data)) {
            error_log('Model::create - Empty data after filtering fillable fields');
            return false;
        }
        
        $columns = array_keys($data);
        $values = [];
        $placeholders = [];
        
        // Prepare values and placeholders, handling NULL values properly
        foreach ($data as $key => $value) {
            $columns[] = $key;
            if ($value === null) {
                $placeholders[] = 'NULL';
                // Don't add to values array for NULL
            } else {
                $placeholders[] = '?';
                $values[] = $value;
            }
        }
        
        // Rebuild columns array (remove duplicates if any)
        $columns = array_unique($columns);
        
        // Filter out NULL placeholders and their corresponding columns
        $finalColumns = [];
        $finalPlaceholders = [];
        $finalValues = [];
        
        foreach ($data as $key => $value) {
            $finalColumns[] = $key;
            if ($value === null) {
                $finalPlaceholders[] = 'NULL';
            } else {
                $finalPlaceholders[] = '?';
                $finalValues[] = $value;
            }
        }
        
        $sql = sprintf(
            "INSERT INTO %s (%s) VALUES (%s)",
            $this->table,
            implode(', ', $finalColumns),
            implode(', ', $finalPlaceholders)
        );
        
        try {
            error_log('Model::create - Attempting insert. Table: ' . $this->table . ' | Data keys: ' . implode(', ', array_keys($data)));
            error_log('Model::create - SQL: ' . $sql);
            error_log('Model::create - Values count: ' . count($finalValues) . ' | Values: ' . json_encode($finalValues));
            
            $result = $this->db->execute($sql, $finalValues);
            
            // execute returns rowCount, which should be 1 for successful INSERT
            if ($result === false || $result < 1) {
                error_log('Model::create - Execute returned false or 0 rows. Result: ' . var_export($result, true) . ' | SQL: ' . $sql . ' | Values: ' . json_encode($values));
                return false;
            }
            
            $insertId = $this->db->lastInsertId();
            
            if (!$insertId || $insertId == 0) {
                error_log('Model::create - lastInsertId returned 0 or false. Result: ' . var_export($insertId, true) . ' | SQL: ' . $sql);
                return false;
            }
            
            error_log('Model::create - Success. Insert ID: ' . $insertId);
            return $insertId;
        } catch (\PDOException $e) {
            error_log('Model::create - PDO Exception: ' . $e->getMessage() . ' | Code: ' . $e->getCode() . ' | SQL: ' . $sql . ' | Values: ' . json_encode($values));
            throw $e;
        } catch (\Exception $e) {
            error_log('Model::create - Exception: ' . $e->getMessage() . ' | SQL: ' . $sql . ' | Values: ' . json_encode($values));
            throw $e;
        }
    }
    
    /**
     * Update record
     */
    public function update($id, $data)
    {
        // Filter only fillable fields
        $data = $this->filterFillable($data);
        
        if (empty($data)) {
            return false;
        }
        
        $columns = array_keys($data);
        $values = array_values($data);
        
        $set = array_map(function($col) {
            return "$col = ?";
        }, $columns);
        
        $sql = sprintf(
            "UPDATE %s SET %s WHERE %s = ?",
            $this->table,
            implode(', ', $set),
            $this->primaryKey
        );
        
        $values[] = $id;
        
        return $this->db->execute($sql, $values);
    }
    
    /**
     * Delete record
     */
    public function delete($id)
    {
        $sql = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = ?";
        return $this->db->execute($sql, [$id]);
    }
    
    /**
     * Count records
     */
    public function count($where = null, $params = [])
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->table}";
        
        if ($where) {
            $sql .= " WHERE {$where}";
        }
        
        $result = $this->db->fetch($sql, $params);
        return $result['count'] ?? 0;
    }
    
    /**
     * Filter fillable fields
     */
    protected function filterFillable($data)
    {
        if (empty($this->fillable)) {
            return $data;
        }
        
        return array_intersect_key($data, array_flip($this->fillable));
    }
    
    /**
     * Hide fields from result
     */
    protected function hideFields($data)
    {
        if (empty($this->hidden)) {
            return $data;
        }
        
        foreach ($this->hidden as $field) {
            unset($data[$field]);
        }
        
        return $data;
    }
    
    /**
     * Custom query
     */
    public function query($sql, $params = [])
    {
        return $this->db->fetchAll($sql, $params);
    }
    
    /**
     * Execute custom query
     */
    public function execute($sql, $params = [])
    {
        return $this->db->execute($sql, $params);
    }
}

