<?php

	header("Content-type: application/json");

	if (isset($_GET['dir'])) {
		$dirContent = array_values(array_diff(scandir('../' . $_GET['dir']), array('.DS_Store', '..', '.')));
		$retval = (!empty($dirContent)) ? array('status' => 1, 'content' => $dirContent) : array('status' => null) ;
		echo json_encode($retval, true);
	}
	if (isset($_GET['cd'])) {
		if (preg_match("/\.\./", $_GET['cd']) === 0) {
			$retval = (file_exists('../' . $_GET['cd'])) ? array('status' => 1) : array('status' => null) ;
		} else {
			$retval = array('status' => 2);
		}
		echo json_encode($retval);
	}
	if (isset($_GET['user']) && isset($_GET['pass'])) {
		echo ($_GET['user'] === '' && $_GET['pass'] === '') ? json_encode(array('status' => 1)) : json_encode(array('status' => null)) ;
	}
	if (isset($_GET['open'])) {
		$response = new stdClass();
		$response->name = basename($_GET['open'], '.' . pathinfo($_GET['open'], PATHINFO_EXTENSION));
		$response->path = $_GET['open'];
		$response->type = fileCategory(pathinfo($_GET['open'], PATHINFO_EXTENSION));
		$response->exists = file_exists('../' . $_GET['open']);
		if ($response->type === 'text') {
			$response->content = file_get_contents('../' . $_GET['open']);
		}
		echo json_encode($response);
	}
	if (isset($_GET['send'])) {
		$num = $_GET['send'];
		$response = new stdClass();
		$response->status = ($num == 60) ? 1 : 0;
		$response->message = ($num == 60) ? 'April 1968' : 'Incorrect value!';
		echo json_encode($response);
	}

	function fileCategory($ext) {
		switch ($ext) {
			case 'txt':
			case 'sql':
				return 'text';
			case 'mp3':
				return 'music';
			default:
				return 'unknown';
		}
	}
?>
