var instance_skel = require('../../instance_skel');
var http = require('http');
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
									label: 'Filename',
									id:    'file_name'
								},
								{
									type:  'textinput',
									label: 'Sign ID',
									id:    'sign_id',
									default: '264x480:primary/fullscreen'
								}
							]
						},
			'blank_display': {
							label: 'Blank Display',
							options: [
								{
									type:  'textinput',
									label: 'Sign ID',
									id:    'sign_id',
									default: '264x480:primary/fullscreen'
								}
							]
						}			
		});
	}
	action(action) {
		var self = this;
		var url = 'http://' + self.config.host + ':' + self.config.port;
		var sign_id=action.options.sign_id;

		// Create http request client
		var request = require("request")
		var envelope_header='<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Header><h:PlayControlOperationHeader xmlns:h="http://standards.daktronics.com/schemas/playerservices/playercontrol_1_0.wsdl" xmlns="http://standards.daktronics.com/schemas/playerservices/playercontrol_1_0.wsdl" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"/></s:Header><s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">';
		var envelope_footer='</s:Body></s:Envelope>';

		switch (action.action){
			case 'play_file':
				var unique_file_name = action.options.file_name;
				var body = envelope_header + '<Play xmlns="http://standards.daktronics.com/schemas/playerservices/playercontrol_1_0.wsdl"><sign><Mode>Name</Mode><SignId>' + sign_id + '</SignId></sign><options><File><Mode>UniqueFilename</Mode><UniqueFilename>' + unique_file_name + '</UniqueFilename></File><PlayMode>Continuous</PlayMode></options></Play>' + envelope_footer;					
			break
			case 'blank_display':
			var body = envelope_header + '<Blank xmlns="http://standards.daktronics.com/schemas/playerservices/playercontrol_1_0.wsdl"><sign><Mode>Name</Mode><SignId>' + sign_id + '</SignId></sign></Blank>' + envelope_footer;					
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
				type:    'textinput',
				id:      'host',
				label:   'DMP 8000 IP Address',
				tooltip: 'The IP of the Daktronics DMP 8000 Server',
				width:   6,
				regex:   self.REGEX_IP
			},
			{
				type:    'textinput',
				id:      'port',
				label:   'Daktronics DMP 8000 Port Number (default 4502)',
				tooltip: 'The Port Number that Daktronics DMP 8000 is listening on.',
				width:   6,
				default: '4502'
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
