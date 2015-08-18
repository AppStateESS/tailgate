<?php

namespace tailgate\Controller\Admin;

use tailgate\Factory\Visitor as Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Visitor extends Base
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
                return $this->getList($factory, TG_LIST_ACTIVE, 'university');
        }
    }

    public function post(\Request $request)
    {
        $factory = new Factory;
        if (!$request->isVar('command')) {
            throw new \Exception('Bad command');
        }
        switch ($request->getVar('command')) {
            case 'add':
                $this->add();
                exit;

            case 'deactivate':
                return $this->deactivate($factory, $request->getVar('visitor_id'));
                break;

            default:
                throw new \Exception('Bad command:' . $request->getVar('command'));
        }
    }

    private function add()
    {
        $university = filter_input(INPUT_POST, 'university', FILTER_SANITIZE_STRING);
        $mascot = filter_input(INPUT_POST, 'mascot', FILTER_SANITIZE_STRING);

        $visitor = new \tailgate\Resource\Visitor;

        $visitor->setUniversity($university);
        $visitor->setMascot($mascot);

        $factory = new Factory;
        $factory->save($visitor);
    }

    /*
      protected function deactivate(\Request $request)
      {
      $factory = new Factory;
      $factory->deactivate($request->getVar('visitor_id'));
      $view = new \View\JsonView(array('success' => true));
      $response = new \Response($view);
      return $response;
      }
     */
}
