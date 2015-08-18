<?php

namespace tailgate\Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Visitor extends \ResourceFactory
{

    public static function save(\tailgate\Resource\Visitor $visitor)
    {
        self::saveResource($visitor);
    }

    public static function getList($mode=TG_LIST_ALL)
    {
        $db = \Database::getDB();
        $tbl = $db->addTable('tg_visitor');
        $tbl->addOrderBy('university');
        switch ($mode) {
            case TG_LIST_ACTIVE:
                $tbl->addFieldConditional('active', 1);
                break;
            
            case TG_LIST_INACTIVE:
                $tbl->addFieldConditional('active', 0);
                break;
        }
        
        $result = $db->select();
        return $result;
    }

}
