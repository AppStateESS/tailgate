<?php

namespace tailgate\Factory;
use tailgate\Resource\Visitor as Resource;
/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Visitor extends Base
{
    protected $table = 'tg_visitor';

    public function postNew()
    {
        $university = filter_input(INPUT_POST, 'university', FILTER_SANITIZE_STRING);
        $mascot = filter_input(INPUT_POST, 'mascot', FILTER_SANITIZE_STRING);

        $visitor = new \tailgate\Resource\Visitor;

        $visitor->setUniversity($university);
        $visitor->setMascot($mascot);

        self::saveResource($visitor);
    }
    
    public static function getById($id)
    {
        $visitor = new Resource;
        $visitor->setId($id);
        
        self::loadByID($visitor);
        return $visitor;
    }
}
