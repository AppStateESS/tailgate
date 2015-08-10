<?php

namespace tailgate\Resource;

/**
 * Information on team playing on campus
 * 
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Visitor extends \Resource
{
    /**
     * Name of university
     * @var Variable\String
     */
    protected $university;

    /**
     * Name of mascot
     * @var Variable\String
     */
    protected $mascot;

    /**
     * Image file for university
     * @var Variable\File
     */
    protected $image;
    protected $table = 'tg_visitor';
    
    public function __construct()
    {
        $this->university = new \Variable\String(null, 'university');
        $this->mascot = new \Variable\String(null, 'mascot');
        $this->image = new \Variable\File(null, 'image');
    }

}
