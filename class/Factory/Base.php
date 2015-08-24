<?php

namespace tailgate\Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
abstract class Base extends \ResourceFactory
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

    public function getListDB($mode = TG_LIST_ALL, $order_by = null)
    {
        $db = \Database::getDB();
        $tbl = $db->addTable($this->table);
        if (!empty($order_by)) {
            $tbl->addOrderBy($order_by);
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

}
