<?php

namespace tailgate\Controller\Admin;

use tailgate\Factory\Lot as Factory;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Lot extends Base
{

    protected function getJsonView($data, \Canopy\Request $request)
    {
        $command = $request->getVar('command');
        $factory = new Factory;

        switch ($command) {
            case 'list':
                $json = $factory->getList(TG_LIST_ALL, 'title');
                break;
        }
        $view = new \View\JsonView($json);
        return $view;
    }

    public function post(\Canopy\Request $request)
    {
        $factory = new Factory;
        $view = new \View\JsonView(array('success' => true));
        $response = new \Canopy\Response($view);

        if (!$request->isVar('command')) {
            throw new \Exception('Bad command');
        }
        switch ($request->getVar('command')) {
            case 'add':
                $factory->postNew();
                break;

            case 'deactivate':
                $this->deactivate($factory, filter_input(INPUT_POST, 'lotId', FILTER_SANITIZE_NUMBER_INT));
                break;
            
            case 'activate':
                $this->activate($factory, filter_input(INPUT_POST, 'lotId', FILTER_SANITIZE_NUMBER_INT));
                break;
            
            case 'delete':
                Factory::delete(filter_input(INPUT_POST, 'lotId', FILTER_SANITIZE_NUMBER_INT));
                break;

            default:
                throw new \Exception('Bad command:' . $request->getVar('command'));
        }
        return $response;
    }

    protected function deactivate($factory, $id)
    {
        $game = \tailgate\Factory\Game::getCurrent();
        if (!empty($game) && $game->getSignupStart() < time()) {
            throw \Exception('Lots cannot be deactivated after game signup has started.');
        }
        
        $factory->deactivate($id);

        $db = \Database::getDB();
        $tbl = $db->addTable('tg_spot');
        $tbl->addValue('active', 0);
        $tbl->addFieldConditional('lot_id', $id);
        $db->update();

        $view = new \View\JsonView(array('success' => true));
        $response = new \Canopy\Response($view);
        return $response;
    }
    protected function activate($factory, $id)
    {
        $factory->activate($id);

        $db = \Database::getDB();
        $tbl = $db->addTable('tg_spot');
        $tbl->addValue('active', 1);
        $tbl->addFieldConditional('lot_id', $id);
        $db->update();

        $view = new \View\JsonView(array('success' => true));
        $response = new \Canopy\Response($view);
        return $response;
    }

}
