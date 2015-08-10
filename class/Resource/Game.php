<?php

namespace tailgate\Resource;

/**
 * Information on game played on campus.
 * 
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Game extends \Resource
{
    /**
     * Id of Visitor record
     * @var \Variable\Integer
     */
    protected $visitor_id;

    /**
     * Unix time of kick off
     * @var \Variable\DateTime
     */
    protected $kickoff;
    
    protected $table = 'tg_game';

    public function __construct()
    {
        $this->visitor_id = new \Variable\Integer(null, 'visitor_id');
        $this->kickoff = new \Variable\DateTime(null, 'kickoff');
    }

}
