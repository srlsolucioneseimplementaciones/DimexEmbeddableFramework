window.Framework = {
    config: {
        name:"EmbedClient",
        clientIds: {
			"mypurecloud.com": "0b2e63ff-7200-4b96-ae90-2184d5dbaf3f"
            //'mypurecloud.com': 'd4f23a5d-19fc-4a7e-8766-62e4f1aa97d1'
        },
        customInteractionAttributes: ['IDCAMPACTCRM', 'telefonoRegistrado','IdActividad', 'telefonoBusqueda'],										 																		
            settings: {
				embedWebRTCByDefault: true,
				hideWebRTCPopUpOption: false,
				enableCallLogs: true,
				hideCallLogSubject: true,
				hideCallLogContact: false,
				hideCallLogRelation: false,
				enableTransferContext: false,
				dedicatedLoginWindow:false,
				embedInteractionWindow:false,
				enabledConfigurableCalledId:false,
				enableServersideLogging: false,
				searchTargets: ['people', 'queues', 'externalContacts'],
				display: {
					interactionDetails: {
						call:[
							'framework.DisplayAddress',
							'call.ani',
							'call.ConversationId',
							'framework.ParticipantId'
						],
						chat:[
							'call.ConversationId',
							'framework.ParticipantId'
						]
					}
				}
			},
			getUserLanguage: function (callback) {
				callback("es-MX");
			},
            
            
        },
		
        initialSetup: function () {
            window.PureCloud.subscribe([
                {
                    type: 'Interaction', 
                    callback: function (category, interaction) {
                        window.parent.postMessage(JSON.stringify({type:"interactionSubscription", data:{category:category, interaction:interaction}}) , "*");
                    }  
                },
                {
                    type: 'UserAction', 
                    callback: function (category, data) {
                        window.parent.postMessage(JSON.stringify({type:"userActionSubscription", data:{category:category, data:data}}) , "*");
                    }  
                },
                {
                    type: 'Notification', 
                    callback: function (category, data) {
                        window.parent.postMessage(JSON.stringify({type:"notificationSubscription", data:{category:category, data:data}}) , "*");
                    }  
                }
			 
            ]);
			
			window.addEventListener("message", function(event) {
            try {
                var message = JSON.parse(event.data);
                if(message){
                    if(message.type == "clickToDial"){
                        window.PureCloud.clickToDial(message.data);
                    } else if(message.type == "addAssociation"){
                        window.PureCloud.addAssociation(message.data);
                    } else if(message.type == "addAttribute"){
                        window.PureCloud.addCustomAttributes(message.data);
                    } else if(message.type == "addTransferContext"){
                        window.PureCloud.addTransferContext(message.data);
                    } else if(message.type == "sendContactSearch"){
                        if(contactSearchCallback) {
                            contactSearchCallback(message.data);
                        }
                    } else if(message.type == "updateUserStatus"){
                        window.PureCloud.User.updateStatus(message.data);
                    } else if(message.type == "updateInteractionState"){
                        window.PureCloud.Interaction.updateState(message.data);
                    } else if(message.type == "setView"){
                        window.PureCloud.User.setView(message.data);
                    } else if(message.type == "updateAudioConfiguration"){
                        window.PureCloud.User.Notification.setAudioConfiguration(message.data);
                    } else if(message.type == "sendCustomNotification"){
						var d = JSON.parse(event.data);
						if(d.data.tipo == "wrapup") {
							const token = JSON.parse(localStorage.getItem("pc_auth")).authenticated.access_token;
							const userId = JSON.parse(this.localStorage.getItem("cwcUserStation")).userId;

							let myHeaders = new Headers();
							myHeaders.append("Authorization", "Bearer " + token);

							var requestOptions = {
								method: 'GET',
								headers: myHeaders
							};

							fetch("https://api.mypurecloud.com/api/v2/conversations", requestOptions)
								.then(response => response.text())
								.then(result => {
									let res = JSON.parse(result);
									let conversationId = res.entities[0].id;
									let participantId, communicationId;

									res.entities.forEach(element => {
										element.participants.forEach(participant => {
											if(participant.purpose == "agent" && participant.userId == userId) {
												participantId = participant.id;
												
												if(participant.chats && participant.chats.length > 0) {
													communicationId = participant.chats[participant.chats.length - 1].id;
												}

												if(participant.calls && participant.calls.length > 0) {
													communicationId = participant.calls[participant.calls.length - 1].id;
												}

												if(participant.callbacks && participant.callbacks.length > 0) {
													communicationId = participant.callbacks[participant.callbacks.length - 1].id;
												}
											}
										})
									})

									let headersTwo = new Headers();
									headersTwo.append("Content-Type", "application/json");
									headersTwo.append("Authorization", "Bearer " + token);

									var raw = JSON.stringify({
										"wrapup": {
										  "code": d.data.wrapup
										}
									  });

									  var requestOptions = {
										method: 'PATCH',
										headers: headersTwo,
										body: raw
									  };
									  
									  fetch("https://api.mypurecloud.com/api/v2/conversations/calls/" + conversationId + "/participants/" + participantId, requestOptions)
										  .then(response => response.text())
										  .then(res => {
											  var result = JSON.parse(res);
	
											  if(result.errors) {
												  window.parent.postMessage(JSON.stringify({type:"actionError", data:{ex: result, subject: "wrapup"}}) , "*");
											  }
										  })
										  .catch(function (error) {
											  window.parent.postMessage(JSON.stringify({type:"actionError", data:{ex: error, subject: "wrapup"}}) , "*");
										  });
								})
								.catch(error => {
									this.localStorage.setItem("framework", error);
								})
						}
						
						if(d.data.tipo == "finalizarLlamada") {
							const token = JSON.parse(localStorage.getItem("pc_auth")).authenticated.access_token;
							const userId = JSON.parse(this.localStorage.getItem("cwcUserStation")).userId;
							let myHeaders = new Headers();
							myHeaders.append("Authorization", "Bearer " + token);

							var requestOptions = {
								method: 'GET',
								headers: myHeaders
							};

							fetch("https://api.mypurecloud.com/api/v2/conversations", requestOptions)
								.then(response => response.text())
								.then(result => {
									let res = JSON.parse(result);
									let conversationId = res.entities[0].id;
									let participantId, communicationId;

									res.entities.forEach(element => {
										element.participants.forEach(participant => {
											if(participant.purpose == "agent" && participant.userId == userId) {
												participantId = participant.id;

												if(participant.chats && participant.chats.length > 0) {
													communicationId = participant.chats[participant.chats.length - 1].id;
												}

												if(participant.calls && participant.calls.length > 0) {
													communicationId = participant.calls[participant.calls.length - 1].id;
												}

												if(participant.callbacks && participant.callbacks.length > 0) {
													communicationId = participant.callbacks[participant.callbacks.length - 1].id;
												}
											}
										})
									})

									let headersTwo = new Headers();
									headersTwo.append("Content-Type", "application/json");
									headersTwo.append("Authorization", "Bearer " + token);

									var raw = JSON.stringify({
										"wrapup": {
											"code": d.data.wrapup
										}
									});

									var requestOptions = {
										method: 'PATCH',
										headers: headersTwo,
										body: raw
									};
									  
									fetch("https://api.mypurecloud.com/api/v2/conversations/calls/" + conversationId + "/participants/" + participantId, requestOptions)
										.then(response => response.text())
										.then(res => {
											var result = JSON.parse(res);
	
											if(result.errors) {
												window.parent.postMessage(JSON.stringify({type:"actionError", data:{ex: result, subject: "wrapup"}}) , "*");
											}

											let headersThree = new Headers();
											headersThree.append("Content-Type", "application/json");
											headersThree.append("Authorization", "Bearer " + token);

											var raw = JSON.stringify({
												"wrapup": {
													"code": d.data.wrapup
												},
												"state": "disconnected"
											});

											var requestOptions = {
												method: 'PATCH',
												headers: headersThree,
												body: raw
											};

											fetch("https://api.mypurecloud.com/api/v2/conversations/callbacks/" + conversationId + "/participants/" + participantId + "/communications/" + communicationId, requestOptions)
												.then(resp => resp.text())
												.then(r2 => {})
												.catch(error => {})
										})
										.catch(function (error) {
											window.parent.postMessage(JSON.stringify({type:"actionError", data:{ex: error, subject: "wrapup"}}) , "*");
										});
								})
								.catch(error => {
									this.localStorage.setItem("framework", error);
								})
						}
						
						if(d.data.tipo == "currentConversation") {
							var token = JSON.parse(localStorage.getItem("pc_auth")).authenticated.access_token;
							
							var myHeaders = new Headers();
								myHeaders.append("Authorization", "Bearer " + token);

								var requestOptions = {
									method: 'GET',
									headers: myHeaders
								};
								
								fetch("https://api.mypurecloud.com/api/v2/conversations", requestOptions)
									.then(response => response.text())
									.then(result => {
										window.parent.postMessage(JSON.stringify({type:"currentInteractionsResponse", data:{datos: result}}) , "*");
									})
									.catch(function (error) {
										window.parent.postMessage(JSON.stringify({type:"actionError", data:{ex: error, subject: "wrapup"}}) , "*");
									});
						}
						
                        window.PureCloud.User.Notification.notifyUser(message.data);
                    }
                }
            } catch {
                //ignore if you can not parse the payload into JSON
            }
        });
        },
        screenPop: function (searchString, interaction) {
            window.parent.postMessage(JSON.stringify({type:"screenPop", data:{searchString:searchString, interaction:interaction}}) , "*");
        },
        processCallLog: function (callLog, interaction, eventName, onSuccess, onFailure) {
            if(interaction.state == "CONNECTED" || interaction.state == "INTERACTING") {
				window.parent.postMessage(JSON.stringify({type: "showInteractionWindow", data:{valor: "true"}}), "*");
			}
        },
        openCallLog: function(callLog, interaction){
			window.parent.postMessage(JSON.stringify({type:"openCallLog" , data:{callLog:callLog, interaction:interaction}}) , "*");
        }
    };