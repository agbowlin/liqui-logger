//

var Logger = require('../logger').Logger;

var console_log_target = Logger.AddLogTarget('console');
var file_log_target = Logger.AddLogTarget('file');

Logger.Config.group = 'Test Group';

Logger.LogTrace("This is an Trace message.");
Logger.LogDebug("This is an Debug message.");
Logger.LogInfo("This is an Info message.");
Logger.LogWarning("This is an Warn message.");
Logger.LogError("This is an Error message.");

//==========================================
Logger.LogSeparatorLine();
console_log_target.log_levels = 'IWE';

Logger.LogTrace("This is an Trace message. SHOULD NOT SEE THIS MESSAGE.");
Logger.LogDebug("This is an Debug message. SHOULD NOT SEE THIS MESSAGE.");
Logger.LogInfo("This is an Info message.");
Logger.LogWarning("This is an Warn message.");
Logger.LogError("This is an Error message.");

//==========================================
Logger.LogSeparatorLine();
var obj = {
	Field1: 'Foo',
	Field2: 'Bar'
};
Logger.LogInfo("Here is some extra data:", obj);

//==========================================
Logger.LogSeparatorLine();
console_log_target.log_levels = 'TDIWEF';

console_log_target.output_group = false;
console_log_target.output_date = false;
console_log_target.output_time = false;
console_log_target.output_milliseconds = false;
console_log_target.output_timezone = false;
console_log_target.output_severity = false;
console_log_target.output_severity_words = false;
Logger.LogInfo("This message has no output header fields.");

console_log_target.output_group = true;
Logger.LogInfo("This message has: Group.");

console_log_target.output_date = true;
Logger.LogInfo("This message has: Group, Date.");

console_log_target.output_time = true;
Logger.LogInfo("This message has: Group, Date, Time.");

console_log_target.output_milliseconds = true;
Logger.LogInfo("This message has: Group, Date, Time, Milliseconds.");

console_log_target.output_timezone = true;
Logger.LogInfo("This message has: Group, Date, Time, Milliseconds, Timezone.");

console_log_target.output_severity = true;
Logger.LogInfo("This message has: Group, Date, Time, Milliseconds, Timezone, Severity.");

console_log_target.output_severity_words = true;
Logger.LogInfo("This message has: Group, Date, Time, Milliseconds, Timezone, Severity Words.");

//==========================================
Logger.LogSeparatorLine();
try
{
	throw "This is a thrown exception!";
}
catch (exception)
{
	Logger.LogError(exception, exception);
}

//==========================================
Logger.LogSeparatorLine();
Logger.LogInfo("Its all good, exiting now.");

process.exit();
