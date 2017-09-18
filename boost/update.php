<?php

function tailgate_update(&$content, $currentVersion)
{
    switch ($currentVersion) {
        case (version_compare($currentVersion, '1.1.0', '<')):
            $db = \phpws2\Database::getDB();
            $tbl = $db->addTable('tg_student');
            $column = $tbl->getDataType('user_id');
            $unique = new \phpws2\Database\Unique($column);
            $unique->add();
            $content[] = <<<EOF
<pre>
    +added unique index to user_id in tg_student
    +safety checks added
</pre>
EOF;
        case (version_compare($currentVersion, '1.2.0', '<')):
            $db = \phpws2\Database::getDB();
            $tbl = $db->addTable('tg_game');
            $dt = new \phpws2\Database\Datatype\Smallint($tbl, 'lottery_started');
            $dt->setDefault(0);
            $dt->add();

            $db = \phpws2\Database::getDB();
            $tbl = $db->addTable('tg_lottery');
            $dt = new \phpws2\Database\Datatype\Smallint($tbl, 'emailed');
            $dt->setDefault(0);
            $dt->add();

            $db = \phpws2\Database::getDB();
            $tbl = $db->addTable('tg_lottery');
            $columns[] = $tbl->getDataType('student_id');
            $columns[] = $tbl->getDataType('game_id');
            $unique = new \phpws2\Database\Unique($columns);
            $unique->add();

            $content[] = <<<EOF
<pre>
    + Flagging beginning of lottery
    + Logging winner emails
    + Unique keys added to tg_lottery to prevent repeats
</pre>
EOF;
        case (version_compare($currentVersion, '1.2.1', '<')):
            $content[] = '<pre>+ Fixed spot report bug</pre>';

        case (version_compare($currentVersion, '1.2.2', '<')):
            $content[] = '<pre>+ Removed wkpdftohtml to use dompdf.</pre>';
    }
    return true;
}
