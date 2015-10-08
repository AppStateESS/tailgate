<?php

namespace tailgate\Controller\Admin;

use tailgate\Factory\Report as Factory;
use tailgate\Factory\Game as GameFactory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Report extends Base
{

    public function getHtmlView($data, \Request $request)
    {
        if (!$request->isVar('command')) {
            throw new \Exception('Bad command');
        }
        $command = $request->getVar('command');
        
        switch ($command) {
            case 'pickup':
                $content = Factory::pickup(GameFactory::getCurrentId());
                break;
            
            
            default:
                throw new \Exception('Unknown report command');
        }
        
        $view = new \View\HtmlView($content);
        return $view;
    }

}
