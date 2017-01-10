# liqui-logger

An easy logging system implemented for various platforms.

## Log Devices


### Console

```
log_device: 'console'
log_device: 'stdout'
log_device: 'stderr'
```

### File

The File log target is only available in NodeJS.

```
log_device: 'file',
log_path: 'path/to/logs',
log_filename: 'filename',
log_extension: 'log',
use_hourly_logfiles: true,
use_daily_logfiles: true
```
