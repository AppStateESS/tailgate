<?php

namespace tailgate\Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
abstract class Base extends \phpws2\ResourceFactory
{

    public function deactivate($id)
    {
        $db = \Database::getDB();
        $tbl = $db->addTable($this->table);
        $tbl->addFieldConditional('id', $id);
        $tbl->addValue('active', 0);
        $db->update();
    }

    public function activate($id)
    {
        $db = \Database::getDB();
        $tbl = $db->addTable($this->table);
        $tbl->addFieldConditional('id', $id);
        $tbl->addValue('active', 1);
        $db->update();
    }

    /**
     * 
     * @param integer $mode
     * @param string $order_by
     * @param string $order_dir
     * @return \Global\Datanase\DB
     */
    public function getListDB($mode = TG_LIST_ALL, $order_by = null, $order_dir = 'asc')
    {
        $db = \Database::getDB();
        $tbl = $db->addTable($this->table);
        if (!empty($order_by)) {
            $tbl->addOrderBy($order_by, $order_dir);
        }
        switch ($mode) {
            case TG_LIST_ACTIVE:
                $tbl->addFieldConditional('active', 1);
                break;

            case TG_LIST_INACTIVE:
                $tbl->addFieldConditional('active', 0);
                break;
        }
        return $db;
    }

    public function getList($mode = TG_LIST_ALL, $order_by = null)
    {
        $db = $this->getListDB($mode, $order_by);
        $result = $db->select();
        return $result;
    }

    public function load(\Resource $resource)
    {
        self::loadByID($resource);
    }
    
    public function save(\Resource $resource)
    {
        self::saveResource($resource);
    }

}
