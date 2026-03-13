<?php

namespace App\Helpers;

/**
 * Validator Helper - Input validation
 */
class Validator
{
    private $data;
    private $rules;
    private $errors = [];

    public function __construct($data, $rules)
    {
        $this->data = $data;
        $this->rules = $rules;
    }

    /**
     * Validate data
     */
    public function validate()
    {
        foreach ($this->rules as $field => $rules) {
            $rulesArray = explode('|', $rules);

            foreach ($rulesArray as $rule) {
                $this->applyRule($field, $rule);
            }
        }

        return empty($this->errors);
    }

    /**
     * Apply validation rule
     */
    private function applyRule($field, $rule)
    {
        $value = $this->data[$field] ?? null;

        // Parse rule parameters
        $params = [];
        if (strpos($rule, ':') !== false) {
            list($rule, $paramsString) = explode(':', $rule, 2);
            $params = explode(',', $paramsString);
        }

        switch ($rule) {
            case 'required':
                if (empty($value) && $value !== '0') {
                    $this->addError($field, "Field {$field} is required");
                }
                break;

            case 'email':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->addError($field, "Field {$field} must be a valid email");
                }
                break;

            case 'min':
                $min = $params[0] ?? 0;
                if (!empty($value) && strlen($value) < $min) {
                    $this->addError($field, "Field {$field} must be at least {$min} characters");
                }
                break;

            case 'max':
                $max = $params[0] ?? 0;
                if (!empty($value) && strlen($value) > $max) {
                    $this->addError($field, "Field {$field} must not exceed {$max} characters");
                }
                break;

            case 'numeric':
                if (!empty($value) && !is_numeric($value)) {
                    $this->addError($field, "Field {$field} must be numeric");
                }
                break;

            case 'integer':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_INT)) {
                    $this->addError($field, "Field {$field} must be an integer");
                }
                break;

            case 'alpha':
                if (!empty($value) && !ctype_alpha($value)) {
                    $this->addError($field, "Field {$field} must contain only letters");
                }
                break;

            case 'alphanumeric':
                if (!empty($value) && !ctype_alnum($value)) {
                    $this->addError($field, "Field {$field} must contain only letters and numbers");
                }
                break;

            case 'url':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_URL)) {
                    $this->addError($field, "Field {$field} must be a valid URL");
                }
                break;

            case 'confirmed':
                $confirmField = $field . '_confirmation';
                if (!empty($value) && $value !== ($this->data[$confirmField] ?? null)) {
                    $this->addError($field, "Field {$field} confirmation does not match");
                }
                break;

            case 'in':
                if (!empty($value) && !in_array($value, $params)) {
                    $this->addError($field, "Field {$field} must be one of: " . implode(', ', $params));
                }
                break;

            case 'unique':
                // Format: unique:table,column
                if (!empty($value) && count($params) >= 2) {
                    $table = $params[0];
                    $column = $params[1];
                    $except = $params[2] ?? null;

                    if (!$this->isUnique($table, $column, $value, $except)) {
                        $this->addError($field, "Field {$field} already exists");
                    }
                }
                break;

            case 'exists':
                // Format: exists:table,column
                if (!empty($value) && count($params) >= 2) {
                    $table = $params[0];
                    $column = $params[1];

                    if (!$this->exists($table, $column, $value)) {
                        $this->addError($field, "Field {$field} does not exist");
                    }
                }
                break;

            case 'date':
                if (!empty($value) && !strtotime($value)) {
                    $this->addError($field, "Field {$field} must be a valid date");
                }
                break;

            case 'phone':
                // Accept phone numbers with or without + prefix, 10-15 digits
                // Examples: +201066536008, 01066536008, +20 106 653 6008
                if (!empty($value) && !preg_match('/^\+?[0-9\s\-\(\)]{9,20}$/', $value)) {
                    $this->addError($field, "Field {$field} must be a valid phone number");
                }
                break;
        }
    }

    /**
     * Check if value is unique in database
     */
    private function isUnique($table, $column, $value, $except = null)
    {
        $db = \App\Core\Database::getInstance();

        $sql = "SELECT COUNT(*) as count FROM {$table} WHERE {$column} = ?";
        $params = [$value];

        if ($except) {
            $sql .= " AND id != ?";
            $params[] = $except;
        }

        $result = $db->fetch($sql, $params);

        return $result['count'] == 0;
    }

    /**
     * Check if value exists in database
     */
    private function exists($table, $column, $value)
    {
        $db = \App\Core\Database::getInstance();

        $sql = "SELECT COUNT(*) as count FROM {$table} WHERE {$column} = ?";
        $result = $db->fetch($sql, [$value]);

        return $result['count'] > 0;
    }

    /**
     * Add validation error
     */
    private function addError($field, $message)
    {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }

        $this->errors[$field][] = $message;
    }

    /**
     * Get validation errors
     */
    public function errors()
    {
        return $this->errors;
    }

    /**
     * Check if validation passed
     */
    public function passed()
    {
        return empty($this->errors);
    }

    /**
     * Check if validation failed
     */
    public function failed()
    {
        return !empty($this->errors);
    }
}
