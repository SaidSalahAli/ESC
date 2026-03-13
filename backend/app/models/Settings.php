<?php

namespace App\Models;

use App\Core\Model;

class Settings extends Model
{
    protected $table = 'settings';
    protected $fillable = ['key_name', 'value'];
    protected $primaryKey = 'id';

    /**
     * Find setting by key
     */
    public function findByKey($key)
    {
        return $this->findOneBy('key_name', $key);
    }

    /**
     * Get setting value by key
     */
    public function getValue($key, $default = null)
    {
        $setting = $this->findByKey($key);
        return $setting ? $setting['value'] : $default;
    }

    /**
     * Update or create setting
     */
    public function setSetting($key, $value, $type = 'string', $description = null)
    {
        $setting = $this->findByKey($key);

        if ($setting) {
            // Update existing setting - only update 'value' since that's the only column
            return $this->update($setting['id'], [
                'value' => $value
            ]);
        } else {
            // Create new setting
            return $this->create([
                'key_name' => $key,
                'value' => $value
            ]);
        }
    }

    /**
     * Get all settings as key => value pairs
     */
    public function getAllSettings()
    {
        $settings = $this->all();
        $result = [];

        foreach ($settings as $setting) {
            $result[$setting['key_name']] = $setting['value'];
        }

        return $result;
    }
}
