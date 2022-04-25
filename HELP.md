# companion-module-daktronics-showcontrol
# Daktronics Show Control Client Module for Companion
v 1.0.1
4/29/19
Eddie Wettach <ewettach@gmail.com>

## Change Log
1.0.1 - Added some customization and default options in the settings of the module.
        Added logging to see what is being played out to troubleshoot path/filename issues.
1.0.0 - Initial Support - play still images/videos and blank display

## Requirements:
1.  Companion
2.  Daktronics DMP (Tested with DMP 8000 v1.37.0.32, v2.34.0.115, but probably works with others)

## How to:
1.  Add an instance of Show Control Client to Companion.
2.  Configure the IP address of the Daktronics DMP and port number if needed
3.  Set optional starting paths and sign id if desired
3.  Configure a button with the action Play File or Blank Display
4.  Follow more specific steps below under "Actions" depending on what you selected in the above #4


## Actions:
### Play File

Allows user to play a still image or video. 

#### Parameters:

- **Absolute File Path**: The absolute path to the file to be played (i.e C:/data/pictures/sample.png).  Will override relative file path if set.
- **Relative File Path**: The relative path to the file to be played (i.e pictures/sample.png).  This assumes that a default path is set in the settings.
- **Sign ID**: The id of the sign to be played on (i.e. 264x480:primary/fullscreen).  Leave blank to use the default in settings.




