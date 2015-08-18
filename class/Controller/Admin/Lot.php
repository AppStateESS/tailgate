<?php

namespace tailgate\Controller\Admin;

use tailgate\Factory\Lot as Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Lot extends Base
{

    public function get(\Request $request)
    {
        $data = array();
        $view = $this->getView($data, $request);
        $response = new \Response($view);
        return $response;
    }

    protected function getJsonView($data, \Request $request)
    {
        $command = $request->getVar('command');
        $factory = new Factory;
        
        switch ($command) {
            case 'list':
                return $this->getList($factory, TG_LIST_ACTIVE, 'title');
        }
    }

}
