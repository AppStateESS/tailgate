<?php

namespace tailgate\Controller\Admin;

/**
 * @license http://opensource.org/licenses/lgpl-3.0.html
 * @author Matthew McNaney <mcnaney at gmail dot com>
 */
class Setup extends \Http\Controller
{
    /*
      public function get(\Request $request)
      {
      $data = array();
      $view = $this->getView($data, $request);
      $response = new \Response($view);
      return $response;
      }
     * 
     */

    public function get(\Request $request)
    {
        $command = $request->shiftCommand();
        if (empty($command)) {
            $data = array();
            $view = $this->getView($data, $request);
            $response = new \Response($view);
            return $response;
        } else {
            $view = $this->getAdminCommand($command, $request);
            return $view->get($request);
        }
    }

    private function getAdminCommand($command, $request)
    {
        $className = 'tailgate\Controller\Admin\\' . $command;
        if (!class_exists($className)) {
            throw new \Http\NotAcceptableException($request);
        }
        $adminCommand = new $className($this->getModule());
        return $adminCommand;
    }

    public function getHtmlView($data, \Request $request)
    {
        \Layout::addStyle('tailgate', 'Admin/Setup/style.css');
        $development = true;

        if ($development) {
            $script_file = 'src/script.jsx';
            $type = 'text/jsx';
        } else {
            $script_file = 'build/script.js';
            $type = 'text/javascript';
        }

        $data['development'] = $development;
        $data['addons'] = true;
        javascript('react', $data);
        $script = '<script type="' . $type . '" src="' . PHPWS_SOURCE_HTTP .
                'mod/tailgate/javascript/Admin/Setup/' . $script_file . '"></script>';
        \Layout::addJSHeader($script);

        $vars['authkey'] = \Current_User::getAuthKey();

        $content = <<<EOF
<h2>Tailgate</h2>
<div id="tailgate-setup"></div>
EOF;
        $view = new \View\HtmlView($content);
        return $view;
    }

    public function post(\Request $request)
    {
        $command = $request->shiftCommand();
        if (empty($command)) {
            throw new \Http\MethodNotAllowedException();
        } else {
            $view = $this->getAdminCommand($command, $request);
            return $view->post($request);
        }
    }

}
