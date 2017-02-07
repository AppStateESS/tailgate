<?php

namespace tailgate\Resource;

/**
 * Information on parking lot
 * 
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Lot extends \Resource
{
    /**
     * Name of parking lot
     * @var Variable\StringType
     */
    protected $title;

    /**
     * If true, lot is available for lottery
     * @var Variable\Bool
     */
    protected $active;
    protected $table = 'tg_lot';

    public function __construct()
    {
        parent::__construct();
        $this->title = new \phpws2\Variable\TextOnly(null, 'title');
        $this->title->allowEmpty(false);
        $this->active = new \phpws2\Variable\BooleanVar(true, 'active');
    }

    public function setTitle($title)
    {
        $this->title->set($title);
    }

}
