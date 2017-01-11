#!/usr/bin/php
<?php
//=====================================================================
//=====================================================================
//
//		build/push.php
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
function LogText($Text)
{
	echo($Text."\n");
	return;
}


//---------------------------------------------------------------------
function LogSeparator()
{
	LogText('---------------------------------------------------------------------');
	return;
}


//---------------------------------------------------------------------
function GetFileContents($Filename, $Log)
{
	if (file_exists($Filename))
	{
		if ($Log)
		{
			LogText('Found ' . $Filename . ' file.');
		}
		$file_content = file_get_contents($Filename);
		return $file_content;
	}
	else
	{
		if ($Log)
		{
			LogText('WARNING: ' . $Filename . ' file is missing!');
		}
		return null;
	}
}


//---------------------------------------------------------------------
function ExecuteCommand( $Command )
{
	$result_lines = [];
	$script_stdout_lines = [];
	$script_return_value = '';
	exec( $Command, $script_stdout_lines, $script_return_value );
	foreach( $script_stdout_lines as $line )
	{
		if(strlen( $line ))
		{
			$result_lines []= $line;
			LogText( "\t| ".$line );
		}
	}
	return $result_lines;
}


//=====================================================================
//		Initialize Script
//=====================================================================


LogSeparator();
LogText('Initializing push ...');


//---------------------------------------------------------------------
// Initialize some working variables.
$working_directory = getcwd();
$test_mode = false;
// $test_mode = true;


//---------------------------------------------------------------------
// Load the npm config.
$npm_config = null;
$project_name = '<unknown project>';
$project_version = '';
$file_content = GetFileContents('package.json', true);
if ($file_content)
{
	$npm_config = json_decode($file_content);
	$project_name = $npm_config->name;
	$project_version = $npm_config->version;
}


//---------------------------------------------------------------------
// Load the bower config.
$bower_config = null;
$file_content = GetFileContents('bower.json', true);
if ($file_content)
{
	$bower_config = json_decode($file_content);
	if ($bower_config->name != $npm_config->name)
	{
		LogText('WARNING: The bower project name does not match the npm project name!');
	}
	if ($bower_config->version != $npm_config->version)
	{
		LogText('WARNING: The bower project version does not match the npm project version!');
	}
}


//---------------------------------------------------------------------
// Get the project version.
$version = null;
$file_content = GetFileContents('VERSION', true);
if ($file_content)
{
	$version = $file_content;
	if ($version != $npm_config->version)
	{
		LogText('WARNING: The file project version does not match the npm project version!');
	}
}


//---------------------------------------------------------------------
// Get the commit message.
$commit_message = '';
if (count( $argv ) >= 2)
{
	$commit_message = $argv[1];
}
else
{
	LogText('WARNING: Commit message is missing!');
	// commit_message = '"Incremental update."';
}


//---------------------------------------------------------------------
// Report.
LogSeparator();
LogText("Push: " . $project_name);
LogSeparator();
LogText("   Working Folder : " . $working_directory);
LogText("     Project Name : " . $project_name);
LogText("  Current Version : " . $project_version);
LogText("     Push Message : " . $commit_message);
if( $test_mode )
{
	LogText("        Test Mode : ENABLED");
}


//=====================================================================
//		GIT STATUS
//=====================================================================


//---------------------------------------------------------------------
// Run 'git status' to see what changed.
LogSeparator();
LogText("Getting project status ...");
$result_lines = ExecuteCommand( 'git status --porcelain' );
if (count($result_lines))
{
	LogText('Found ' . count($result_lines) . ' changes.');
}
else
{
	LogText('No changes found.');
}


if (!$commit_message)
{
	LogSeparator();
	LogText('No pushing will be done because the commit message is missing.');
	LogText('Supply a commit message when calling push:');
	LogText("\t" . 'push "commit message"');
}
else
{

	LogSeparator();


	//=====================================================================
	//		GIT ADD .
	//=====================================================================


	LogText('Updating the index ...');
	if( $test_mode )
	{
		$result_lines = ExecuteCommand( 'git add --all --dry-run' );
	}
	else
	{
		$result_lines = ExecuteCommand( 'git add --all' );
	}


	//=====================================================================
	//		GIT COMMIT -m Message
	//=====================================================================


	LogText('Packaging the commit ...');
	if( $test_mode )
	{
		$result_lines = ExecuteCommand( 'git commit --porcelain --message "'.$commit_message.'"' );
	}
	else
	{
		$result_lines = ExecuteCommand( 'git commit --message "'.$commit_message.'"' );
	}


	//=====================================================================
	//		GIT PUSH ORIGIN MASTER
	//=====================================================================


	LogText('Pushing the commit ...');
	if( $test_mode )
	{
		$result_lines = ExecuteCommand( 'git push origin master --dry-run --porcelain' );
	}
	else
	{
		$result_lines = ExecuteCommand( 'git push origin master' );
	}


}


//=====================================================================
//		Exit Script
//=====================================================================


//---------------------------------------------------------------------
LogSeparator();
LogText('Finished.');
LogSeparator();

