<?php

namespace tailgate\Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Visitor extends Base
{
    protected $table = 'tg_visitor';
            
    public function save(\tailgate\Resource\Visitor $visitor)
    {
        self::saveResource($visitor);
    }
    
}
