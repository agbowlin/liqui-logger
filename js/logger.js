//=====================================================================
//=====================================================================
//
//		logger.js
//
//=====================================================================
//=====================================================================

"use strict";

var Logger = {};


//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined')
{
	window['Logger'] = Logger;
}


//=====================================================================
// Integrate with the nodejs environment.
var npm_fs = null;
var npm_path = null;
if (typeof exports != 'undefined')
{
	npm_fs = require('fs');
	npm_path = require('path');
	exports.Logger = Logger;
}


//=====================================================================
// Logger configuration object.
Logger.Config = {
	group: '',
	always_use_utc: false,
	targets: []
};


//=====================================================================
Logger.AddLogTarget =
	function AddLogTarget(LogDevice, LogLevels)
	{
		LogLevels = LogLevels || 'TDIWEF';
		var log_target = {
			log_device: LogDevice,
			log_levels: LogLevels,
			output_group: true,
			output_date: true,
			output_time: true,
			output_milliseconds: true,
			output_timezone: true,
			output_severity: true,
			output_severity_words: true,
			// File specific
			log_path: '',
			log_filename: 'logger',
			log_extension: 'log',
			use_hourly_logfiles: false,
			use_daily_logfiles: false

		};
		Logger.Config.targets.push(log_target);
		return log_target;
	};


// //---------------------------------------------------------------------
// Logger.FormatTimestamp =
// 	function FormatTimestamp(date)
// 	{
// 		// var timestamp = date.toISOString(); //"2011-12-19T15:28:46.493Z"
// 		var timestamp =
// 			date.getFullYear() +
// 			"-" + ("0" + (date.getMonth() + 1)).slice(-2) +
// 			"-" + ("0" + date.getDate()).slice(-2) +
// 			" " + ("0" + date.getHours()).slice(-2) +
// 			":" + ("0" + date.getMinutes()).slice(-2) +
// 			":" + ("0" + date.getSeconds()).slice(-2) +
// 			"." + ("000" + date.getMilliseconds()).slice(-4);
// 		// " " + ("000" + date.getTimezoneOffset()).slice(-4);
// 		return timestamp;
// 	}


// //---------------------------------------------------------------------
// Logger.GetTimestamp =
// 	function GetTimestamp()
// 	{
// 		return Logger.FormatTimestamp(new Date());
// 	}


//=====================================================================
Logger.SendTextToLogTarget =
	function SendTextToLogTarget(Timestamp, Text, LogTarget)
	{
		if ((LogTarget.log_device == 'console') || (LogTarget.log_device == 'stdout'))
		{
			console.log(Text);
		}
		if (LogTarget.log_device == 'stderr')
		{
			console.error(Text);
		}
		else if (LogTarget.log_device == 'file')
		{
			if (npm_fs && npm_path)
			{
				var filename = npm_path.join(LogTarget.log_path, LogTarget.log_filename);
				if (LogTarget.use_hourly_logfiles)
				{
					filename += '-' + Timestamp.toISOString.slice(0, 13).replace(/T/g, '-');
				}
				else if (LogTarget.use_daily_logfiles)
				{
					filename += '-' + Timestamp.toISOString.slice(0, 10);
				}
				if (LogTarget.log_extension)
				{
					filename += '.' + LogTarget.log_extension;
				}
				npm_fs.appendFileSync(filename, Text + "\n");
			}
		}
		return;
	};


//=====================================================================
Logger.LogMessage =
	function LogMessage(Message, Severity, ExtraData)
	{
		var date = new Date();
		var log_entry = {};

		// Get the message group.
		log_entry.group = Logger.Config.group;

		// Get the message timestamp.
		log_entry.date = date.getFullYear() +
			"-" + ("0" + (date.getMonth() + 1)).slice(-2) +
			"-" + ("0" + date.getDate()).slice(-2);
		log_entry.time = ("0" + date.getHours()).slice(-2) +
			":" + ("0" + date.getMinutes()).slice(-2) +
			":" + ("0" + date.getSeconds()).slice(-2);
		log_entry.milliseconds = ("000" + date.getMilliseconds()).slice(-4);

		// Get the timezone offset.
		var timezone_minutes = date.getTimezoneOffset() % 60;
		var timezone_hours = (date.getTimezoneOffset() - timezone_minutes) / 60;
		log_entry.timezone = ("0" + timezone_hours).slice(-2) + ("0" + timezone_minutes).slice(-2);

		// Get the message severity.
		Severity = Severity || 'INFO';
		log_entry.severity = Severity.substr(0, 1).toUpperCase();
		if (log_entry.severity == 'T')
		{
			log_entry.severity_word = 'TRACE';
		}
		else if (log_entry.severity == 'D')
		{
			log_entry.severity_word = 'DEBUG';
		}
		else if (log_entry.severity == 'I')
		{
			log_entry.severity_word = 'INFO ';
		}
		else if (log_entry.severity == 'W')
		{
			log_entry.severity_word = 'WARN ';
		}
		else if (log_entry.severity == 'E')
		{
			log_entry.severity_word = 'ERROR';
		}
		else if (log_entry.severity == 'F')
		{
			log_entry.severity_word = 'FATAL';
		}
		else
		{
			log_entry.severity_word = Severity;
		}

		// Get the message.
		log_entry.message = Message;

		// Emit the log entry to the targets.
		Logger.Config.targets.forEach(
			function(log_target)
			{
				if (log_target.log_levels.indexOf(log_entry.severity) >= 0)
				{
					// Construct the output message.
					var out_message = '';
					var left_side = '| ';
					var right_side = ' ';
					if (log_target.output_group && Logger.Config.group)
					{
						out_message += left_side + Logger.Config.group + right_side;
					}
					if (log_target.output_date && log_entry.date)
					{
						out_message += left_side + log_entry.date + right_side;
					}
					if (log_target.output_time && log_entry.time)
					{
						out_message += left_side + log_entry.time + right_side;
					}
					if (log_target.output_milliseconds && log_entry.milliseconds)
					{
						out_message += left_side + log_entry.milliseconds + right_side;
					}
					if (log_target.output_timezone && log_entry.timezone)
					{
						out_message += left_side + log_entry.timezone + right_side;
					}
					if (log_target.output_severity_words)
					{
						out_message += left_side + log_entry.severity_word + right_side;
					}
					else if (log_target.output_severity)
					{
						out_message += left_side + log_entry.severity + right_side;
					}
					out_message += left_side + log_entry.message;

					// Add the extra data.
					if (ExtraData)
					{
						out_message += "\n" + JSON.stringify(ExtraData, undefined, "    ");
					}

					// Emit the log entry
					Logger.SendTextToLogTarget(date, out_message, log_target);
				}
			});

		// Return the message.
		return log_entry;
	};


//=====================================================================
Logger.LogTrace =
	function LogTrace(Message, ExtraData)
	{
		Logger.LogMessage(Message, 'TRACE', ExtraData);
	};
Logger.LogDebug =
	function LogDebug(Message, ExtraData)
	{
		Logger.LogMessage(Message, 'DEBUG', ExtraData);
	};
Logger.LogInfo =
	function LogInfo(Message, ExtraData)
	{
		Logger.LogMessage(Message, 'INFO', ExtraData);
	};
Logger.LogWarn =
	function LogWarn(Message, ExtraData)
	{
		Logger.LogMessage(Message, 'WARN', ExtraData);
	};
Logger.LogWarning =
	function LogWarning(Message, ExtraData)
	{
		Logger.LogMessage(Message, 'WARN', ExtraData);
	};
Logger.LogError =
	function LogError(Message, ExtraData)
	{
		Logger.LogMessage(Message, 'ERROR', ExtraData);
	};
Logger.LogFatal =
	function LogError(Message, ExtraData)
	{
		Logger.LogMessage(Message, 'FATAL', ExtraData);
	};


//=====================================================================
Logger.LogBlankLine =
	function LogBlankLine()
	{
		Logger.Config.targets.forEach(
			function(log_target)
			{
				Logger.SendTextToLogTarget(new Date(), '', log_target);
			});
	};
Logger.LogSeparatorLine =
	function LogSeparatorLine()
	{
		Logger.Config.targets.forEach(
			function(log_target)
			{
				Logger.SendTextToLogTarget(new Date(), '==========================================', log_target);
			});
	};


//=====================================================================
Logger.ObjectJson =
	function ObjectJson(SomeObject)
	{
		return JSON.stringify(SomeObject, undefined, "    ");
	};


//=====================================================================
Logger.LogObject =
	function LogObject(SomeObject)
	{
		Logger.LogMessage("\n" + Logger.ObjectJson(SomeObject));
		return;
	};
