# isclog-viewer README

This is a basic extension to view isclogs in CSV Format.

It will parse an ISCLOG in a *.isclog file and shows different fields in the logs in tabular form for easier reading.

To export the ISCLog global in the correct format run the following commands:

```ObjectScript
set file = "filepath/filename.isclog" 
open file:"wns" use file zw ^ISCLOG close file
```

Once you have the .isclog file and have installed the extension, you can view the file using the `isclog-viewer` extension.

# How to open .isclog in isclog-viewer?
0. Make sure you have installed the extension.
1. Open the file in the VS Code.
2. Right-Click the filename in Explorer, and click "Reopen Editor with..."
3. Select "InterSystems ISCLOG viewer".

Note: I have tested this on the latest version on healthshare (HS 2024.1), and should work with all IRIS based products.

## Features

These are the different fields that are fetched from the ISCLOGs and displayed in tabular form:
1. ID
2. LogLevel
3. Category
4. Message
5. Pid
6. Namespace
7. TimeAdded
8. Routine
9. Tag
10. SessionId
11. ClassName

- The extension also removes those rows from display that does not contain above information.
- It only displays those rows that are of the form: 
```
^ISCLOG("Data",<ID>)=$lb(...)
```
- An empty cell or "" displays a missing value for that particular field in the log.

## Requirements

- It only works for .isclog files.
- The ISCLOGs must be exported as follows:

```ObjectScript
set file = "C:\InterSystems\IRIS\sample.isclog" 
open file:"wns" use file zw ^ISCLOG close file
```

## Release Notes

### 1.0.0

Initial release of isclog-viewer.

**Chao!**
