<?php

namespace App\Models;

use App\Core\Model;

class ShippingGovernorate extends Model
{
    protected $table = 'shipping_governorates';
    protected $fillable = ['name', 'name_ar', 'shipping_cost', 'is_active', 'sort_order'];
    protected $primaryKey = 'id';

    /**
     * Get all active governorates sorted
     */
    public function getActiveGovernorates()
    {
        $sql = "SELECT * FROM {$this->table} WHERE is_active = 1 ORDER BY sort_order ASC";
        $results = $this->db->fetchAll($sql);
        return array_map([$this, 'hideFields'], $results);
    }

    /**
     * Get shipping cost for a governorate
     */
    public function getShippingCostByName($governorate_name)
    {
        $governorate = $this->findOneBy('name', $governorate_name);
        return $governorate ? $governorate['shipping_cost'] : null;
    }

    /**
     * Get shipping cost by Arabic name
     */
    public function getShippingCostByArabicName($governorate_name_ar)
    {
        $governorate = $this->findOneBy('name_ar', $governorate_name_ar);
        return $governorate ? $governorate['shipping_cost'] : null;
    }

    /**
     * Update shipping cost for a governorate
     */
    public function updateShippingCost($id, $new_cost)
    {
        return $this->update($id, ['shipping_cost' => $new_cost]);
    }

    /**
     * Toggle governorate active status
     */
    public function toggleActive($id)
    {
        $governorate = $this->find($id);
        if (!$governorate) return false;

        return $this->update($id, ['is_active' => !$governorate['is_active']]);
    }
}
