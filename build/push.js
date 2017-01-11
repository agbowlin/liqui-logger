#!/usr/bin/env node

//=====================================================================
//=====================================================================
//
//		build/push.js
//
//=====================================================================
//=====================================================================

// Includes
var npm_path = require('path');
var npm_fs = require('fs');
var npm_execSync = require('child_process').execSync;
var npm_spawnSync = require('child_process').spawnSync;


//---------------------------------------------------------------------
function LogSeparator()
{
	console.log('---------------------------------------------------------------------');
	return;
}


//---------------------------------------------------------------------
function ReadFile(Filename, Log)
{
	if (npm_fs.existsSync(Filename))
	{
		if (Log)
		{
			console.log('Found ' + Filename + ' file.');
		}
		var file_content = npm_fs.readFileSync(Filename);
		return file_content;
	}
	else
	{
		if (Log)
		{
			console.log('WARNING: ' + Filename + ' file is missing!');
		}
		return null;
	}
}


//---------------------------------------------------------------------
function GetGitStatus()
{
	var changed_files = [];
	var result_buffer = npm_execSync('git status --porcelain');
	var result_string = String.fromCharCode.apply(null, result_buffer);
	var result_lines = result_string.split("\n");
	result_lines.forEach(
		function(line)
		{
			if (line.length > 2)
			{
				var file = {};
				file.filename = line.slice(3);
				file.status = line.slice(0, 2);
				changed_files.push(file);
			}
		});
	return changed_files;
}


//=====================================================================
//		Initialize Script
//=====================================================================


LogSeparator();
console.log("Initializing push ...");


//---------------------------------------------------------------------
// Initialize some working variables.
var working_directory = process.cwd();
var file_content = null;


//---------------------------------------------------------------------
// Load the npm config.
var npm_config = null;
var project_name = '<unknown project>';
var project_version = '';
file_content = ReadFile('package.json', true);
if (file_content)
{
	npm_config = JSON.parse(file_content);
	project_name = npm_config.name;
	project_version = npm_config.version;
}


//---------------------------------------------------------------------
// Load the bower config.
var bower_config = null;
file_content = ReadFile('bower.json', true);
if (file_content)
{
	bower_config = JSON.parse(file_content);
	if (bower_config.name != npm_config.name)
	{
		console.log('WARNING: The bower project name does not match the npm project name!');
	}
	if (bower_config.version != npm_config.version)
	{
		console.log('WARNING: The bower project version does not match the npm project version!');
	}
}


//---------------------------------------------------------------------
// Get the project version.
var version = null;
file_content = ReadFile('VERSION', true);
if (file_content)
{
	version = String.fromCharCode.apply(null, file_content);
	if (version != npm_config.version)
	{
		console.log('WARNING: The file project version does not match the npm project version!');
	}
}


//---------------------------------------------------------------------
// Get the commit message.
var commit_message = '';
if (process.argv.length >= 3)
{
	commit_message = process.argv[2];
}
else
{
	console.log('WARNING: Commit message is missing!');
	// commit_message = '"Incremental update."';
}


//---------------------------------------------------------------------
// Report.
LogSeparator();
console.log("Push: " + project_name);
LogSeparator();
console.log("   Working Folder : " + working_directory);
console.log("     Project Name : " + project_name);
console.log("  Current Version : " + project_version);
console.log("     Push Message : " + commit_message);


//=====================================================================
//		GIT STATUS
//=====================================================================


//---------------------------------------------------------------------
// Run 'git status' to see what changed.
LogSeparator();
console.log("Getting project status ...");
var changed_files = GetGitStatus();
if (changed_files.length)
{
	console.log('Found the following changes:');
	changed_files.forEach(
		function(file)
		{
			console.log("\t" + file.status + "\t" + file.filename);
		});
}
else
{
	console.log('No changes found.');
}


if (!commit_message)
{
	LogSeparator();
	console.log('No pushing will be done because the commit message is missing.');
	console.log('Supply a commit message when calling push:');
	console.log("\t" + 'push "commit message"');
}
else
{

	LogSeparator();
	var result_buffer = null;
	var result_string = null;

	//=====================================================================
	//		GIT ADD .
	//=====================================================================

	console.log('Updating the index ...');
	result_buffer = npm_execSync('git add --all --dry-run');
	result_string = String.fromCharCode.apply(null, result_buffer);
	console.log(result_string);

	//=====================================================================
	//		GIT COMMIT -m Message
	//=====================================================================

	console.log('Packaging the commit ...');
	// result_buffer = npm_execSync('git commit --dry-run --porcelain --message \"' + commit_message + '\"');
	// result_buffer = npm_execSync('git commit --dry-run --porcelain');
	result_buffer = npm_spawnSync('git', ['commit', '--porcelain'], {stdio: [0, 1, 2]});
	result_string = String.fromCharCode.apply(null, result_buffer);
	console.log(result_string);


	//=====================================================================
	//		GIT PUSH ORIGIN MASTER
	//=====================================================================

	console.log('Pushing ...');


}

//=====================================================================
//		Exit Script
//=====================================================================


//---------------------------------------------------------------------
LogSeparator();
console.log('Finished.');
LogSeparator();
process.exit();
