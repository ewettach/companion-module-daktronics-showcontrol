var instance_skel = require('../../instance_skel');
var http = require('http');
const { lowerFirst } = require('lodash');
var debug;
var log;

/**
 * Companion instance for Daktronics Display Studio.
 * @author Eddie Wettach <ewettach@gmail.com>
 */


class instance extends instance_skel {
	constructor(system, id, config) {
		super(system, id, config);
		var self = this;
		// DMP 8000 Port #
		self.port = 4502;
		self.actions();
	}

	actions(system) {
		var self = this;
		self.system.emit('instance_actions', self.id, {
            'play_file': {
							label: 'Play File',
							options: [
								{
									type:  'textinput',
									label: 'Absolute Filepath and filename. Will over ride relative path if set.',
									id:    'file_name'
								},
								{
									type:  'textinput',
									label: 'Relative Filepath and filename. Assumes a default path is set in settings.',
									id:    'relative_name'
								},
								{
									type:  'textinput',
									label: 'Sign ID (leave blank to use default set in settings)',
									id:    'sign_id'
								}
							]
						},
			'blank_display': {
							label: 'Blank Display',
							options: [
								{
									type:  'textinput',
									label: 'Sign ID (leave blank to use default set in settings)',
									id:    'sign_id'
								}
							]
						}			
		});
	}
	action(action) {
		var self = this;
		var url = 'http://' + self.config.host + ':' + self.config.port;
		var sign_id=action.options.sign_id;
		if (!sign_id) {
			sign_id = self.config.default_sign_id;
		}
		// Create http request client
		var request = require("request")
		var envelope_header='<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Header><h:PlayControlOperationHeader xmlns:h="http://standards.daktronics.com/schemas/playerservices/playercontrol_1_0.wsdl" xmlns="http://standards.daktronics.com/schemas/playerservices/playercontrol_1_0.wsdl" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"/></s:Header><s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">';
		var envelope_footer='</s:Body></s:Envelope>';

		switch (action.action) {
			case 'play_file':
				// If the absolute path and filename is set, then use it, otherwise use the relative path and filename.
				if (action.options.file_name) {
					var unique_file_name = action.options.file_name;
				} else {
					var unique_file_name = self.config.default_path + action.options.relative_name;
				}
				// for adding double backslashes in the filepath and filename 
				let regex = /\\/g;

				var body = envelope_header + '<Play xmlns="http://standards.daktronics.com/schemas/playerservices/playercontrol_1_0.wsdl"><sign><Mode>Name</Mode><SignId>' + sign_id + '</SignId></sign><options><File><Mode>UniqueFilename</Mode><UniqueFilename>' + unique_file_name.replace(regex, "\\\\") + '</UniqueFilename></File><PlayMode>Continuous</PlayMode></options></Play>' + envelope_footer;
				this.log("info", "Playing File: " + unique_file_name + " on sign id: " + sign_id);
			break
			case 'blank_display':
				var body = envelope_header + '<Blank xmlns="http://standards.daktronics.com/schemas/playerservices/playercontrol_1_0.wsdl"><sign><Mode>Name</Mode><SignId>' + sign_id + '</SignId></sign></Blank>' + envelope_footer;					
				this.log("info", "Blanking Display: " + sign_id);
			break
		}

		var requestData = {
			host: self.config.host,
			path: "/PlayerControl.asmx",
			port: self.config.port,
			method: "POST",
			headers: {
				'Content-Type': 'text/xml',
				'SOAPAction': 'http://standards.daktronics.com/schemas/playerservices/playercontrol/1_0/Play',
				'Content-Length': Buffer.byteLength(body)
			}
		};	
		
		
		var buffer = "";

		var req = http.request( requestData, function( res )    {
		
		   console.log( res.statusCode );
		   var buffer = "";
		   res.on( "data", function( data ) { buffer = buffer + data; } );
		   res.on( "end", function( data ) { console.log( buffer ); } );
		
		});
		
		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});
		
		req.write( body );
		req.end();	
	}
	// Web config fields
	config_fields () {
		var self = this;
		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: '',
				value: "<br>", // space to separate settings
			},
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'IP Address and Port Settings',
				value:
						'Below set the IP address and port of the Daktronics DMP 8000.   The default port is 4502.',
			},
			{
				type:    'textinput',
				id:      'host',
				label:   'DMP IP Address',
				tooltip: 'The IP of the Daktronics DMP Server',
				width:   8,
				regex:   self.REGEX_IP
			},
			{
				type:    'textinput',
				id:      'port',
				label:   'DMP Port Number',
				tooltip: 'The Port Number that Daktronics DMP is listening on.',
				width:   4,
				default: '4502'
			},
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: '',
				value: "<br>", // space to separate settings
			},
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'OPTIONAL SETTINGS',
				value: '',
			},
				{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Default Path (Optional)',
				value:
					'Below set the default path for files that are to be played; i.e. <b>C:\\DaktronicsData\\Videos\\</b><br>If default path is set, then the button instances should only use relative paths.',
			},
			{
				type:    'textinput',
				id:      'default_path',
				label:   'Default Path of files stored on DMP.',
				tooltip: "i.e. C:\\Data\\  (If left blank, specify the whole path on each button instance)",
				width:   12,
				default: ''
			},{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Sign ID (Optional)',
				value:
							'Below set the default sign id, i.e. <b>264x480:primary/fullscreen</b><br>If the default sign id is set, then button instances that do not specify a sign id will use the default set here. ',
			},
			{
				type:    'textinput',
				id:      'default_sign_id',
				label:   'Default Sign ID on DMP.',
				tooltip: "i.e. 264x480:primary/fullscreen  (If left blank, specify the sign id on each button instance)",
				width:   8,
				default: ''
			}
		]
	}


	destroy() {
		var self = this;
		debug("destroy");
	}

	init() {
		var self = this;
		self.status(self.STATE_OK);
		debug = self.debug;
		log = self.log;
	}

	updateConfig(config) {
		var self = this;

		self.config = config;
	}
}

exports = module.exports = instance;
