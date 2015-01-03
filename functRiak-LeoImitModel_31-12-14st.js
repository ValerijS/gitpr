//Algorithm  for  an Imitation model for Riak system.
function riakModel() {

// declaration  part:

    var count_of_nodes,
        count_of_gateway_nodes,
	    key_of_bucket_or_needle, //key_bucket(key of needle) = 'kt_u' = 'k' + t + '_' + u,where t,u - integer.
		value_of_Riak_object, // context of write request (really - numbers of  steps of iteration   with write_action in format: "t_u"; or "0" (for outdated information).
		
        metaRiak_objects, // = [[type of Riak object, data size of Riak object in conditional units,  value_of_Riak_object, coefficient  for probability of failure for this type, time size of Riak object in conditional units],...], type may be: "text", "foto","vidio", or others, example: [["text", 0.01, value_of_Riak_object, 0,1, 0.001], ["foto", 2, value_of_Riak_object, 1, 0.1], ["vidio", 50, value_of_Riak_object, 5, 1]] .
        probabilities_selectings_of_metaRiak_objects, // example: [0.5, 0.3, 0.2].
		current_bucket_or_needle, // element (item) of metaRiak_objects.
		obj_current, //dictionary(for current pars "key:value" (Riak objects)): {key_of_bucket_or_needle:current_bucket_or_needle}.
		
	    n_value, //the datum will replicated to "n_value" separated partitions of the Riak Ring("n_value" copies will be stored at different servers(nodes)).
        w_value,//min number for write copies.
        r_value, //min number for read copies.
        
        
        list_of_entering_keys,
        total_time_of_finish_performance_actions_at_node,
		gossip_protocol,
        count_of_data_in_node,
        cluster, //= [[node_i(name(number) of node(server), i - integer),  working_status(1 - working server, 0 - failure), {key_of_bucket_or_needle:Riak_object_value}, count_of_data_in_node, total_time_of_finish_performence_actions_at_node, i],...].
        gateway_cluster, 
		clusterForKey,
		value_of_UpdataForCurrRiak_object,
		
   
        write_action,
        p_of_write_action, //probability of failure for action, which performs  with a  cond. unit of data.
        use_of_resource_by_write_action, //resource for performing action with	conditional unit of data.
        probOfGetNewKeyInWriteReqwest,		
		metaDataForKey,
	    read_action,
        p_of_read_action,   //so on ...
        use_of_resource_by_read_action,
	  
	    send_action,
        p_of_send_action,    //so on ...
        use_of_resource_by_send_action,
		use_time_for_performance_send_net_action_with_one_cond_unit_of_data, //in conditional time units.
	    
		p_of_local_failure,//lag of Riak object.
		use_time_for_performance_local_action_with_one_cond_unit_of_data, //in conditional time units.
		count_of_time_for_performance_local_action_with_meta_data, //for service system.
		
		time_for_performance_repair_action,
		
        storage_action,
        p_of_storage_action,
        use_of_resource_by_storage_action,
	   
	    use_of_resource_for_seaching_one_Riak_object_at_one_node,
		
	    total_count_of_data, // in all servers,
	    total_used_resource,
		total_time_of_finish_imitatiion,
        total_use_of_resource_by_write_action,
        total_use_of_resource_by_read_action,
        total_use_of_resource_by_send_action,
	    total_count_of_failures,//net's  partitions,  failures of  equipment.
	    count_of_read_lags,//cases of outdated information.
	    count_of_read_failures,// failures with   requests  for getting data, decreasing of the availability.
		count_of_write_failures,
        count_of_failures_for_write_action,
		count_of_right_write_action,
        count_of_failures_for_send_action,
        count_of_failures_for_read_action,
		count_of_local_failure,
		count_of_right_read_action,
		max_lag_of_performance_of_read_request,
		max_lag_of_performance_for_gateway_nodes,
		interval_for_repair,
		level_of_intensivity_of_requests,
	    count_of_iterations_for_algorithm,
		k, n, r, rr, c, j, g, d, b, L, M, G, Int, bound, curr_ar, curr_nod, nod, change_gossip_protocol, node, node1,

		rem, //array of arrays:rem[i][j] - variations( for: performance time (i=0), resources (i=1), probabilities (i=2)), which are depend from  level remoteness (transcontinental(j=4), great (j=3), middle (j=2), local (j=1)).
        matrix, //array of arrays:matrix[i][j] - level remoteness(1(L),2(M),3(G),4(Int)) between nodes node-i and node_j.

		
		
//Initial setting part:
  	write_action = 'write';
    read_action = 'read';
    send_action = 'send';
    actions = [write_action, read_action];
	probabilities_of_actions = [0.5, 0.5];
	probOfGetNewKeyInWriteReqwest = 0.3;
	
	p_of_write_action = document.getElementById("fname1").value || 0.01; //("par1").innerHTML; //a probability of  a failure for a write_action, when it is performing with one cond. unit of data.Not more than 0.3
	use_of_resource_by_write_action = 1; //resource for performing action with one conditional unit of data).
	
    p_of_read_action = document.getElementById("fname4").value || 0.01; //("par4").innerHTML;Not more than 0.3
	use_of_resource_by_read_action = 1;
	  
    p_of_send_action = document.getElementById("fname3").value || 0.01; //("par3").innerHTML;Not more than 0.3
	use_of_resource_by_send_action = 3;
	use_time_for_performance_send_net_action_with_one_cond_unit_of_data = 0.1;
	
	p_of_local_failure = document.getElementById("fname11").value || 0.01; //("par11").innerHTML;Not more than 0.3
	use_time_for_performance_local_action_with_one_cond_unit_of_data = 1; //in conditional time units.
	count_of_time_for_performance_local_action_with_meta_data = 0.21;
	
	time_for_performance_repair_action = 0.5;
	
    p_of_storage_action = 1e-6;
    use_of_resource_by_storage_action = 0.001;
    
	value_of_Riak_object = '';
    metaRiak_objects = [["text", 0.01, value_of_Riak_object, 0.1, 0.001], ["foto", 2, value_of_Riak_object, 1, 0.1], ["vidio", 50,  value_of_Riak_object, 3, 1]];//Value of Riak object = [type of Riak object, data size of Riak object in conditional units,  context(really - input time), coefficient  for probability of failure for this type, time size of Riak object in conditional units], type may be: ["text", 0.01, t, 0,1, 0.001], ["foto", 2, t, 1, 0.1], ["vidio", 50, t, 5, 1]. 
	probabilities_selectings_of_metaRiak_objects = [0.5, 0.3, 0.2]; //each item corresponds corresponding item from Riak_objects.
	obj_current = {start:['start', 0.001, 0.55, 0.1, 0.201]};
	use_of_resource_for_seaching_one_Riak_object_at_one_node = 0.1;
	count_of_nodes = document.getElementById("fname15").value || 50;//("par15").innerHTML; 
    count_of_gateway_nodes = document.getElementById("fname16").value || count_of_nodes;//("par16").innerHTML;     

    n_value = document.getElementById("fname7").value || 3; //("par7").innerHTML;
    w_value = document.getElementById("fname8").value || 2;//("par8").innerHTML;
    r_value = document.getElementById("fname9").value || 2;//("par9").innerHTML;
    rem_type = document.getElementById("fname17").value || 0;
	total_count_of_data = 0;
    total_used_resource = 0;
    total_use_of_resource_by_read_action = 0;
    total_use_of_resource_by_send_action = 0;
    total_use_of_resource_by_write_action = 0;
	total_use_of_resource_by_repair_action = 0;
    total_count_of_failures = 0;
	total_time_of_finish_imitatiion = 0;
    count_of_failures_for_write_action = 0;
    count_of_failures_for_send_action = 0;
    count_of_failures_for_read_action = 0;
    count_of_read_lags = 0;
	count_of_local_failure = 0;
    count_of_read_failures = 0;
    count_of_write_failures = 0;
	count_of_right_read_action = 0;
	count_of_right_write_action = 0;
	count_of_wrong_read_request = 0;
	max_lag_of_performance_of_read_request = 0;
	max_lag_of_performance_for_gateway_nodes = 0;
	level_of_intensivity_of_requests = document.getElementById("fname12").value || 20;("par12").innerHTML;
    count_of_iterations_for_algorithm = document.getElementById("fname5").value || 100;("par5").innerHTML;
    interval_for_repair = document.getElementById("fname10").value || 25; //("par10").innerHTML;
    list_of_entering_keys = ['start'];
	value_of_UpdataForCurrRiak_object = ['value =', 'type ='];
	value_of_UpdataForCurrRiak_object1 = 'value ='
	clusterForKey = {};
	valueOfRiakObj = [];
	metaDataForKey = [['node_' + 0, 1, 0 +'_'+ 0]];
	clusterForKey  = {};
    for (k = 1; k <=  n_value; k++) {
        clusterForKey['node_' + k] = [ '0-0 is value = empty then: ', 0, [0, 0]];
        metaDataForKey.push(['node_' + k, 0, [0, 0]]);
    }
	gateway_cluster = [];

	gossip_protocol =[{start:[0, 0]}, {start:metaDataForKey}, {start:clusterForKey}, {start:[0, 0]}, {}, {start:['start']}, {start:[]}, {start:''}, {}, {}, {start:{node_1:['kuku']}}, {start:['history']}];
     cluster = [];
	    
    for (k = 1; k <=  count_of_nodes; k++) {
        cluster.push(['node_' + k, 1, {}, 0, {}, 0, k]);
    }
    if ( count_of_gateway_nodes > count_of_nodes) {
        count_of_gateway_nodes = count_of_nodes;
    }
	for (k = 1; k <= count_of_gateway_nodes; k++) {

        gateway_cluster.push(cluster[(Math.floor(count_of_nodes/count_of_gateway_nodes) * k) - 1]);

    }


    matrix = [[]];
    switch (rem_type) {
        case "1": 
           for (i=1; i <= count_of_nodes; i++) {
               matrix[i] = [];
               for (j = 1; j <= count_of_nodes; j++) {
                   matrix[i][j] = Math.floor((Math.abs(i - j)/count_of_nodes) * 4) + 1;
               }
            }
            break;
        case "2":
            for (i=1; i <= count_of_nodes; i++) {
               matrix[i] = [];
               for (j = 1; j <= count_of_nodes; j++) {
                   matrix[i][j] = Math.floor((Math.min(Math.abs(i - j), count_of_nodes - Math.abs(i - j))/count_of_nodes) * 4) + 1;
               }
            }
            break;
        default:
            for (i=1; i <= count_of_nodes; i++) {
               matrix[i] = [];
               for (j = 1; j <= count_of_nodes; j++) {
                   matrix[i][j] = Math.floor((Math.min(Math.abs(i - j), count_of_nodes - Math.abs(i - j))/count_of_nodes) * 4) + 1;
               }
            }

    }
    L = 0; M = 0; G = 0; Int = 0;


//console.log(matrix[count_of_nodes -1][21], rem_type);  
    rem = [[]];
    for (i=0; i <= 2; i++) {
        rem[i] = [];
        for (j = 1; j <= 4; j++) {
        rem[i][j] = (1 + j/10) * (0.1 + i);
//console.log(rem[i][j]); 
        }
    }
    dist_of_pair = [0, 1, 1];
    bound = 1; 
//console.log(rem[0][3]);  
	
	
//part for function's definitions:
    function randomElection(objects, probabilities) { //Elects  one of Objects: - objects[i] with a Probability: - probabilities[i], 0 <= i < objects.length, objects.length == probabilities.length.
        var a, b, c, i;
        a = 0;
        b = 0;
        c = Math.random();
        for (i = 0; i < probabilities.length; i = i + 1) {
            b = a + probabilities[i];
            if (a <= c &&  c < b) {
                return objects[i];
            } else {
                a = b;
            }
        }
    }
              
    function randomElectAndDeleteItem(name_of_array) {
        var index_of_item =  Math.floor(name_of_array.length * Math.random());
        return  name_of_array.splice(index_of_item, 1);//, name_of_array]; // [item, array after deleting].
    }
        function uniformDistrOf_n_Elem(n) { //uniform distribution of n elememnts.
        var uniform_distr_of_n_elem = [];//uniform distribution of n elememnts.
        var i;
        for (i = 0; i < n; i = i + 1) {
            uniform_distr_of_n_elem.push(1 / n);
        }
        return uniform_distr_of_n_elem;
    }
    
    function electOfEventWithProbability_p(p) { //Test: Was  an event, which has probability p?
        return randomElection([true, false], [p, 1 - p]);
    }
	
	
	
// iteration's part, beginning:
    var current_node,
        obj_current,
		gossip_protocol_repair,
        current_bucket_or_needle,
		key_of_bucket_or_needle,
        gtw_curr_nod,
        dist_of_pair,
        distance,
        pair,
        curr_time_min,
        time_min,
        i_min, 
		t, m, w, v, v1, u, l, a;
   
    t = 0;
	  
    m = 0;
    
    w = 0;
	v = 0;
	gossip_protocol_repair = [['start', 0, 0.65]];
    while (t < count_of_iterations_for_algorithm) { //do
        t = t + 1;
			u = 0;
		
		
		
// iteration's part, repair action:	
        
        if (t % interval_for_repair == interval_for_repair - 1) {
		            w++;
					for (x in gossip_protocol[10]) {
					    v1 =0;
					    for (node in gossip_protocol[10][x]) {
                             if (gossip_protocol[10][x][node]) {
				            if (gossip_protocol[10][x][node][3]) {
							 l = 0;
                            gossip_protocol[2][x] = {};
					 while (l < w_value) {
                   	m = (m + 1) % count_of_nodes;
					cluster[m][5] = Math.max(cluster[m][5], t) + time_for_performance_repair_action;//time performance repair.
					total_time_of_finish_imitatiion = Math.max(total_time_of_finish_imitatiion, cluster[m][5]);
                    gossip_protocol[2][x][cluster[m][0]] = ['_' + t + '--' + u + '_re- ' + gossip_protocol[10][x][node][3], cluster[m][5], [-gossip_protocol[10][x][node][2][0], gossip_protocol[10][x][node][2][1]]];
                    
					//gossip_protocol_repair.push([cluster[m][0] , 1, gossip_protocol[4][x], "repair" + t]);
 		total_use_of_resource_by_repair_action = total_use_of_resource_by_repair_action +  obj_current[x][1] * use_of_resource_by_send_action;
                   l = l +1;
					}
                    for (node1 in gossip_protocol[10][x]) {
                        gossip_protocol[10][x][node1][3] = 0;
                        }
                    break;
							    
								} 
							}
						
                    
				  	if ( gossip_protocol[8][x]) {				
					    count_of_write_failures  = count_of_write_failures - 1;
						gossip_protocol[8][x] = 0;
					}	
 		            total_use_of_resource_by_repair_action = total_use_of_resource_by_repair_action +  obj_current[x][1] * use_of_resource_by_send_action;
                 
                    total_use_of_resource_by_repair_action = total_use_of_resource_by_repair_action + use_of_resource_for_seaching_one_Riak_object_at_one_node * (gossip_protocol[1][x].length - 1);
			}
            
		}	
            
			
		for (n = 0; n < cluster.length; n++) {
			cluster[n][1] = 1;
				
		}
		
		total_used_resource = total_used_resource + total_use_of_resource_by_repair_action;
				
	}
	
// iteration's part:				
           
        while (u < level_of_intensivity_of_requests) {
		u = u + 1;
		
        current_action = randomElection(actions , probabilities_of_actions ); //random election of action.
//console.log(gateway_cluster, 'rew1');alert(gateway_cluster);
        gtw_curr_nod = randomElectAndDeleteItem(gateway_cluster);//Gateway operation with write request(begin).
//console.log(gateway_cluster, 'rew11');alert(gateway_cluster);
        gtw_curr_nod[0][5] = Math.max(gtw_curr_nod[0][5], t) + count_of_time_for_performance_local_action_with_meta_data;
        max_lag_of_performance_for_gateway_nodes = gtw_curr_nod[0][5] - t;
		
        gateway_cluster = gateway_cluster.concat(gtw_curr_nod); //Gateway operation with write request(finish). 
//console.log(gateway_cluster, cluster,'rew2',u,t);alert(gateway_cluster);		 
		 
// iteration's part, write action:
	     
	      
        if (current_action === write_action) {//then do a realisation of  the action.
           // w = 0;
            
            if (electOfEventWithProbability_p(probOfGetNewKeyInWriteReqwest)) {
               
                 list_of_entering_keys.push('k' + t + '_' + u);
                key_of_bucket_or_needle = 'k' + t + '_' + u;

                gossip_protocol[0][key_of_bucket_or_needle] = [];
                gossip_protocol[1][key_of_bucket_or_needle] = [['start', 0, 0]];
				gossip_protocol[6][key_of_bucket_or_needle] = [];
				gossip_protocol[5][key_of_bucket_or_needle] = [];
				gossip_protocol[3][key_of_bucket_or_needle] = [];
				gossip_protocol[7][key_of_bucket_or_needle] = '';
				gossip_protocol[2][key_of_bucket_or_needle]	= {}; //  {node_1:['beginning(no reguler), then:', 0, [0, 0],0], node_2:['beginning(no reguler), then:', 0, [0, 0],0]};
				gossip_protocol[4][key_of_bucket_or_needle]	= {};
				gossip_protocol[8][key_of_bucket_or_needle]	= 0;
                gossip_protocol[9][key_of_bucket_or_needle]	= {};
                gossip_protocol[10][key_of_bucket_or_needle] = {}; //node_1:['beginning, then:', 0, [0, 0],0], node_2:['beginning, then:', 0, [0, 0],0];
                gossip_protocol[11][key_of_bucket_or_needle]	= ['history:  ']; 
                current_bucket_or_needle =  randomElection(metaRiak_objects, probabilities_selectings_of_metaRiak_objects); // random election of Raik object, which is coming.
                obj_current[key_of_bucket_or_needle] = current_bucket_or_needle;
                gossip_protocol[3][key_of_bucket_or_needle] = [t, u];
                
			    gossip_protocol[5][key_of_bucket_or_needle].push(current_bucket_or_needle[0] + '_' + t + '_' + u);
				
			    curr_nod = [];
    			
			    
				 c = 0;
			
			    change_gossip_protocol = [['new' + t + '_' + u]];
                
                curr_ar = [];
                a = 0;
		        r = 0;
                j = 0;
        while (j < n_value) {
            j = j + 1;
                curr_time_min = total_time_of_finish_imitatiion;
                
                for (i = 0; i < cluster.length; i++) {
                    if (matrix[gtw_curr_nod[0][6]][cluster[i][6]] <= b) {
                        if (cluster[i][5] <= curr_time_min) {
                            curr_time_min = cluster[i][5];
                            i_min = i;
                        }
                    }
                }
                curr_nod = cluster.splice([i_min],1);
                i_min = undefined; 
              
                //curr_nod = randomElectAndDeleteItem(cluster);
                //pair = [gtw_curr_nod[0], curr_nod[0]];
                //distance = {pair:[0.8, 1.5, 1.3]};
                switch (matrix[curr_nod[0][6]][gtw_curr_nod[0][6]]) {
                                case 1:
                                    L++; 
                                    break;
                                case 2:
                                    M++;
                                    break;
                                case 3:
                                    G++;
                                    break;
                                case 4:
                                    Int++;
                            } 
                if (rem_type) {
                    dist_of_pair = [rem[0][matrix[curr_nod[0][6]][gtw_curr_nod[0][6]]], rem[1][matrix[curr_nod[0][6]][gtw_curr_nod[0][6]]], rem[2][matrix[curr_nod[0][6]][gtw_curr_nod[0][6]]]];
                }
			    if(curr_nod[0]) {
					
                    if (curr_nod[0][1]) {
				
					    if (randomElection([1, 0], [1 - (p_of_send_action * dist_of_pair[1]) * current_bucket_or_needle[3], (p_of_send_action * dist_of_pair[1]) * current_bucket_or_needle[3]])) {
					
                            if (randomElection([1, 0], [1 - p_of_write_action * current_bucket_or_needle[3], p_of_write_action * current_bucket_or_needle[3]])) { //write_action finished right.
						
							    if (randomElection([1, 0], [1 - p_of_local_failure * current_bucket_or_needle[3]/current_bucket_or_needle[3], p_of_local_failure * current_bucket_or_needle[3]/current_bucket_or_needle[3]])) {
                            curr_nod[0][2][key_of_bucket_or_needle] = t + '_' + u; //current_bucket_or_needle, put new Riak objeckt, or fresh information with same key value.
			                curr_nod[0][3] = curr_nod[0][3] + current_bucket_or_needle[1]; //fresh information.
							curr_nod[0][5] = Math.max(curr_nod[0][5], gtw_curr_nod[0][5], t) + (use_time_for_performance_local_action_with_one_cond_unit_of_data * current_bucket_or_needle[4]) + dist_of_pair[0];//time for performance local action.
							total_time_of_finish_imitatiion = Math.max(total_time_of_finish_imitatiion,curr_nod[0][5]);	
							change_gossip_protocol.push([curr_nod[0][0], 10, t +'_' + u]);//succesful write action for node.
							gossip_protocol[2][key_of_bucket_or_needle][curr_nod[0][0]] = ['beginning: no commit ( < w_value ) value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [-t, u]];
                            gossip_protocol[9][key_of_bucket_or_needle][curr_nod[0][0]] = ['value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [t, u]];
                            //if(gossip_protocol[10][key_of_bucket_or_needle]) { 
							gossip_protocol[10][key_of_bucket_or_needle][curr_nod[0][0]] = ['value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [-t, u], '-pair: add  --value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' ]; 
                           // }
							gossip_protocol[10][key_of_bucket_or_needle]['uch' + a++] = ['value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [t, u], '-pair: add  --value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' ]; 
                            
                            total_count_of_data  = total_count_of_data + current_bucket_or_needle[1]; //fresh information
			                total_used_resource = total_used_resource + (use_of_resource_by_write_action + use_of_resource_by_send_action * dist_of_pair[2]) * current_bucket_or_needle[1]; //fresh information.
                            total_use_of_resource_by_write_action = total_use_of_resource_by_write_action + current_bucket_or_needle[1];
                            total_use_of_resource_by_send_action = total_use_of_resource_by_send_action + use_of_resource_by_send_action * (current_bucket_or_needle[1] * dist_of_pair[2]);
							gossip_protocol[11][key_of_bucket_or_needle][0] = gossip_protocol[11][key_of_bucket_or_needle][0] + 'write ok: value - ' + t + '_' + u + ' at ' + curr_nod[0][0] + ' and ';
							if(gossip_protocol[1][key_of_bucket_or_needle]) {
								gossip_protocol[1][key_of_bucket_or_needle].push([curr_nod[0][0], 10, t + '_' + u]);
								}
							r = r + 1;
							c = c + 1;
							} else {
								rr = rr + 1;
								r = r + 1; //p = p + 1;
                                c = c + 1
                                curr_nod[0][5] = Math.max(curr_nod[0][5], gtw_curr_nod[0][5], t) + (use_time_for_performance_local_action_with_one_cond_unit_of_data * current_bucket_or_needle[4]) + dist_of_pair[0];//time for performance local action.
							    total_time_of_finish_imitatiion = Math.max(total_time_of_finish_imitatiion,curr_nod[0][5]);	
							    change_gossip_protocol.push([curr_nod[0][0], 10, t +'_' + u]);//succesful write action for node.
								change_gossip_protocol.push([curr_nod[0][0], 11, 0, t + '_' + u])
								if(gossip_protocol[1][key_of_bucket_or_needle]) {
								gossip_protocol[1][key_of_bucket_or_needle].push([curr_nod[0][0], 11, 'local_fall-' +  t + '_' + u]);
								}
                                gossip_protocol[11][key_of_bucket_or_needle][0] = gossip_protocol[11][key_of_bucket_or_needle][0] + 'local_failure: value - ' + t + '_' + u + ' at ' + curr_nod[0][0] + ' and ';
                                gossip_protocol[2][key_of_bucket_or_needle][curr_nod[0][0]] = ['beginning: no commit ( < w_value ) value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [-t, u]]; 
								gossip_protocol[9][key_of_bucket_or_needle][curr_nod[0][0]] = [' value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + ' (loc)-and, then: -', curr_nod[0][5], [t, u]];
                               // if(gossip_protocol[10][key_of_bucket_or_needle][curr_nod[0]]) { 
								gossip_protocol[10][key_of_bucket_or_needle][curr_nod[0][0]] = ['(loc) value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -', curr_nod[0][5], [-t, u], '-pair: read_lag--value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' ]; 
                               // }
							   gossip_protocol[10][key_of_bucket_or_needle]['uch' + a++] = ['value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [t, u], '-pair: add  --value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' ]; 

                                 //gossip_protocol[11][key_of_bucket_or_needle] + 'node-' + curr_nod[0][0] + 'loc failure value ' + t + '_' + u;
								curr_nod[0][2][key_of_bucket_or_needle] = 0; //current_bucket_or_needle, put new Riak objeckt
								curr_nod[0][3] = curr_nod[0][3] + current_bucket_or_needle[1]; //fresh information.
								//c = c - 1;
								total_count_of_failures = total_count_of_failures + 1; //fresh information.
								total_used_resource = total_used_resource + (use_of_resource_by_write_action + use_of_resource_by_send_action * dist_of_pair[2]) * current_bucket_or_needle[1]; //fresh information.
								total_use_of_resource_by_write_action = total_use_of_resource_by_write_action + current_bucket_or_needle[1];
								total_use_of_resource_by_send_action = total_use_of_resource_by_send_action + use_of_resource_by_send_action * (current_bucket_or_needle[1] * dist_of_pair[2]);
								count_of_local_failure = count_of_local_failure +1;
								
							}
			            } else {
						
							r = r + 1;
							//c = c - 1;
			                curr_nod[0][1] = 0; // set 0 for the work_status node_j.
							if(gossip_protocol[1][key_of_bucket_or_needle]) {
							gossip_protocol[1][key_of_bucket_or_needle].push([curr_nod[0][0], 12, 'write_fall-' + t + u]);
							}
                            gossip_protocol[2][key_of_bucket_or_needle][curr_nod[0][0]] = ['beginning: no commit (write_fall) value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [-t, u]];
							gossip_protocol[11][key_of_bucket_or_needle][0] = gossip_protocol[11][key_of_bucket_or_needle][0] + 'write_fall: value - ' + t + '_' + u + ' at ' + curr_nod[0][0] + ' and ';
							gossip_protocol[9][key_of_bucket_or_needle][curr_nod[0][0]] = ['value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '- no commit, and, then: -' , curr_nod[0][5], [-t, u]];
							//if(gossip_protocol[10][key_of_bucket_or_needle][curr_nod[0]]) {
							gossip_protocol[10][key_of_bucket_or_needle][curr_nod[0][0]] = ['start: write_failure! value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -', curr_nod[0][5], [-t, u], '-pair: write_fall--value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' ];
                           // }
							gossip_protocol[10][key_of_bucket_or_needle]['uch' + a++] = ['value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [t, u], '-pair: add  --value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' ]; 

                                
                            curr_nod[0][2][key_of_bucket_or_needle] = t //current_bucket_or_needle, put new Riak objeckt
			                curr_nod[0][3] = curr_nod[0][3] + current_bucket_or_needle[1]; //fresh information.
			                c = c - 1;
			                total_count_of_failures = total_count_of_failures + 1; //fresh information.
                            count_of_failures_for_write_action = count_of_failures_for_write_action + 1;
                            total_used_resource = total_used_resource + (use_of_resource_by_write_action + use_of_resource_by_send_action * dist_of_pair[2]) * current_bucket_or_needle[1]; //fresh information.
                            total_use_of_resource_by_write_action = total_use_of_resource_by_write_action + current_bucket_or_needle[1];
                            total_use_of_resource_by_send_action = total_use_of_resource_by_send_action + use_of_resource_by_send_action * (current_bucket_or_needle[1] * dist_of_pair[2]);
                        }
                    }else{
                       gossip_protocol[10][key_of_bucket_or_needle][curr_nod[0][0]] = ['start: send_failure! value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [-t, u],  '-pair: send_fall--' + t +'_' + u +'-' + current_bucket_or_needle[0] + '--and-'];
                         
                        gossip_protocol[9][key_of_bucket_or_needle][curr_nod[0][0]] = ['value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '- no commit, and, then: -' , curr_nod[0][5], [-t, u]];
							gossip_protocol[10][key_of_bucket_or_needle]['uch' + a++] = ['value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [t, u], '-pair: add  --value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' ]; 
                        gossip_protocol[2][key_of_bucket_or_needle][curr_nod[0][0]] = ['beginning: no commit (send_failure) value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [-t, u]]; 
                        gossip_protocol[11][key_of_bucket_or_needle][0] = gossip_protocol[11][key_of_bucket_or_needle][0] + 'send_failure: value - ' + t + '_' + u + ' at ' + curr_nod[0][0] + ' and '; 
                        
		                //c = c - 1;
			            total_count_of_failures = total_count_of_failures + 1; //fresh information.
                        count_of_failures_for_send_action = count_of_failures_for_send_action + 1;
				        total_used_resource = total_used_resource + (use_of_resource_by_send_action * dist_of_pair[2]) * current_bucket_or_needle[1];
                        total_use_of_resource_by_send_action = total_use_of_resource_by_send_action + use_of_resource_by_send_action * (current_bucket_or_needle[1] * dist_of_pair[2]);
						 if(gossip_protocol[1][key_of_bucket_or_needle]) {
								    gossip_protocol[1][key_of_bucket_or_needle].push([curr_nod[0][0], 13, t + '_' + u]);
								}
                    }
                }else{
                    
				    gossip_protocol[10][key_of_bucket_or_needle][curr_nod[0][0]] = ['start; status_failure! value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [-t, u], '-pair: satus_failure! value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' ];
                    
                    gossip_protocol[9][key_of_bucket_or_needle][curr_nod[0][0]] = ['value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '- no commit, and, then: -' , curr_nod[0][5], [-t, u]]; 
					gossip_protocol[10][key_of_bucket_or_needle]['uch' + a++] = ['value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [t, u], '-pair: add  --value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' ]; 
                    gossip_protocol[2][key_of_bucket_or_needle][curr_nod[0][0]] = ['beginning: no commit (status_failure) value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [-t, u]];
                     gossip_protocol[11][key_of_bucket_or_needle][0] = gossip_protocol[11][key_of_bucket_or_needle][0] + 'status_failure: value - ' + t + '_' + u + ' at ' + curr_nod[0][0] + ' and '; 
				    if(gossip_protocol[1][key_of_bucket_or_needle]) {
								    gossip_protocol[1][key_of_bucket_or_needle].push([curr_nod[0][0], 14, t + '_' + u]);
								}
		            //c = c - 1;
                }  
                }//else{
	                //c = c - 1;
		       // }
		        curr_ar = curr_ar.concat(curr_nod); 
	        }
                cluster = cluster.concat(curr_ar);
                 gossip_protocol[11][key_of_bucket_or_needle][0] = gossip_protocol[11][key_of_bucket_or_needle][0] + '__NEXT--'; 
				gossip_protocol[1][key_of_bucket_or_needle].push('change_gossip_protocol: ' + change_gossip_protocol);
                if (c < w_value ) {
                if (gossip_protocol[10][key_of_bucket_or_needle] && gossip_protocol[10][key_of_bucket_or_needle][curr_nod[0][0]]) { 
			   	gossip_protocol[10][key_of_bucket_or_needle][curr_nod[0][0]][0] = 	gossip_protocol[10][key_of_bucket_or_needle][curr_nod[0][0]][0] + 'but no commit(<w-value), and -';
                }	
				count_of_write_failures = count_of_write_failures + 1;
				gossip_protocol[8][key_of_bucket_or_needle] = 1;
				
                }else{
				    
				    gossip_protocol[2][key_of_bucket_or_needle] = gossip_protocol[9][key_of_bucket_or_needle];
                    count_of_right_write_action = count_of_right_write_action + 1;
                    gossip_protocol[0][key_of_bucket_or_needle].push([t, u]);
				     for (node1 in gossip_protocol[10][key_of_bucket_or_needle]) {
                        gossip_protocol[10][key_of_bucket_or_needle][node1][3] = 0;
                        }
			    }
	            
            }else{
//main loop(oldKey)			
            
			    curr_nod = [];
                key_of_bucket_or_needle = randomElection(list_of_entering_keys,  uniformDistrOf_n_Elem(list_of_entering_keys.length));  //key 0f  Raik object, which is coming.
				
				current_bucket_or_needle =  randomElection(metaRiak_objects, probabilities_selectings_of_metaRiak_objects); // value of Raik object, which is coming.
				obj_current[key_of_bucket_or_needle] = current_bucket_or_needle;
                gossip_protocol[3][key_of_bucket_or_needle] = [t, u];
			    change_gossip_protocol = [t + '_' + u];
                gossip_protocol[8][key_of_bucket_or_needle] = 0;
			    gossip_protocol[5][key_of_bucket_or_needle].push(current_bucket_or_needle[0] + '_' + t + '_' + u);
			    gossip_protocol[9][key_of_bucket_or_needle] = {};
                //gossip_protocol[10][key_of_bucket_or_needle] = {};  
			     curr_ar = [];
                rr = 0;
		        r = 0;
                j = 0;
				c = 0;
                a = 0;
			for (nod in gossip_protocol[2][key_of_bucket_or_needle]) {
			    for (n = 0; n < cluster.length; n++) {
                    if (cluster[n][0] === nod) {
                        curr_nod[0] = cluster[n];
					}
				}
                switch (matrix[curr_nod[0][6]][gtw_curr_nod[0][6]]) {
                                case 1:
                                    L++; 
                                    break;
                                case 2:
                                    M++;
                                    break;
                                case 3:
                                    G++;
                                    break;
                                case 4:
                                    Int++;
                            }   
                if (rem_type) {
                    dist_of_pair = [rem[0][matrix[curr_nod[0][6]][gtw_curr_nod[0][6]]], rem[1][matrix[curr_nod[0][6]][gtw_curr_nod[0][6]]], rem[2][matrix[curr_nod[0][6]][gtw_curr_nod[0][6]]]];
                } 
				if(curr_nod[0]) {
					
                if (curr_nod[0][1]) {
				
					if (randomElection([1, 0], [1 - (p_of_send_action * dist_of_pair[1]) * current_bucket_or_needle[3], (p_of_send_action * dist_of_pair[1]) * current_bucket_or_needle[3]])) {
					
                        if (randomElection([1, 0], [1 - p_of_write_action * current_bucket_or_needle[3], p_of_write_action * current_bucket_or_needle[3]]))   { //write_action finished right.
						
							if (randomElection([1, 0], [1 - p_of_local_failure * current_bucket_or_needle[3]/current_bucket_or_needle[3], p_of_local_failure * current_bucket_or_needle[3]/current_bucket_or_needle[3]])) {
                            curr_nod[0][2][key_of_bucket_or_needle] = t + '_' + u; //current_bucket_or_needle, put new Riak objeckt, or fresh information with same key value.
			                curr_nod[0][3] = curr_nod[0][3] + current_bucket_or_needle[1]; //fresh information.
							curr_nod[0][5] = Math.max(curr_nod[0][5], gtw_curr_nod[0][5], t) + (use_time_for_performance_local_action_with_one_cond_unit_of_data * current_bucket_or_needle[4]) + dist_of_pair[0];//time for performance local action.
							total_time_of_finish_imitatiion = Math.max(total_time_of_finish_imitatiion,curr_nod[0][5]);	
							change_gossip_protocol.push([curr_nod[0][0], 20, t +'_' + u]);//succesful write action for node.
							
                            gossip_protocol[9][key_of_bucket_or_needle][nod] = [gossip_protocol[2][key_of_bucket_or_needle][nod][0] + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and-', curr_nod[0][5], [t, u]];
                            if(gossip_protocol[10][key_of_bucket_or_needle] && gossip_protocol[10][key_of_bucket_or_needle][nod]) {
                             gossip_protocol[10][key_of_bucket_or_needle][nod] = [gossip_protocol[10][key_of_bucket_or_needle][nod][0] + t +'_' + u + current_bucket_or_needle[0] + '-and-', curr_nod[0][5], [-t, u], gossip_protocol[2][key_of_bucket_or_needle][nod][0] + '-pair: add --value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-,and -' ]; 
                              }
							gossip_protocol[10][key_of_bucket_or_needle]['uch' + a++] = [gossip_protocol[10][key_of_bucket_or_needle]['uch' + a++] +'write ok: value - ' +  t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [t, u],  gossip_protocol[2][key_of_bucket_or_needle][nod][0] + '-pair: add  --value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' ]; 
 
                            [gossip_protocol[11][key_of_bucket_or_needle][0] = gossip_protocol[11][key_of_bucket_or_needle][0] + 'write ok: value - ' + t + '_' + u + ' at ' + curr_nod[0][0] + ' and '];
							total_count_of_data  = total_count_of_data + current_bucket_or_needle[1]; //fresh information
			                total_used_resource = total_used_resource + (use_of_resource_by_write_action + use_of_resource_by_send_action * dist_of_pair[2]) * current_bucket_or_needle[1]; //fresh information.
                            total_use_of_resource_by_write_action = total_use_of_resource_by_write_action + current_bucket_or_needle[1];
                            total_use_of_resource_by_send_action = total_use_of_resource_by_send_action + current_bucket_or_needle[1] * dist_of_pair[2];
							
							
							    if(gossip_protocol[1][key_of_bucket_or_needle]) {
								    gossip_protocol[1][key_of_bucket_or_needle].push([curr_nod[0][0], 20, t + '_' + u]);
								}
							r = r + 1;
							c = c + 1;
							} else {
								rr = rr + 1;
								r = r + 1;
                                c = c + 1;  //p = p + 1;
                                curr_nod[0][5] = Math.max(curr_nod[0][5], gtw_curr_nod[0][5], t) + (use_time_for_performance_local_action_with_one_cond_unit_of_data * current_bucket_or_needle[4]) + dist_of_pair[0];//time for performance local action.
							total_time_of_finish_imitatiion = Math.max(total_time_of_finish_imitatiion,curr_nod[0][5]);	
								change_gossip_protocol.push([curr_nod[0][0], 21, 0, t + '_' + u])
								if(gossip_protocol[1][key_of_bucket_or_needle]) {
								gossip_protocol[1][key_of_bucket_or_needle].push([curr_nod[0][0], 21, t + '_' + u]);
								}
                                gossip_protocol[11][key_of_bucket_or_needle][0] = gossip_protocol[11][key_of_bucket_or_needle][0] + 'loc_failure ok: value - ' + t + '_' + u + ' at ' + curr_nod[0][0] + ' and ';
								gossip_protocol[9][key_of_bucket_or_needle][nod] = [ gossip_protocol[2][key_of_bucket_or_needle][nod][0] + t +'_' + u +'-' + current_bucket_or_needle[0] + ' (loc)-and-', curr_nod[0][5], [t, u]];
                                if(gossip_protocol[10][key_of_bucket_or_needle] && gossip_protocol[10][key_of_bucket_or_needle][nod]) {
								gossip_protocol[10][key_of_bucket_or_needle][nod] = [ gossip_protocol[10][key_of_bucket_or_needle][nod][0] + t +'_' + u +'- (loc) -' + current_bucket_or_needle[0] + '-and-', curr_nod[0][5], [-t, u], gossip_protocol[2][key_of_bucket_or_needle][nod][0] + '-pair: add (loc)__' + t +'_' + u +'-' + current_bucket_or_needle[0] + '--and-'];
                                 }
							gossip_protocol[10][key_of_bucket_or_needle]['uch' + a++] = ['value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [t, u],  gossip_protocol[2][key_of_bucket_or_needle][nod][0] + '-pair: add  --value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' ]; 

								curr_nod[0][2][key_of_bucket_or_needle] = 0; //current_bucket_or_needle, put new Riak objeckt
								curr_nod[0][3] = curr_nod[0][3] + current_bucket_or_needle[1]; //fresh information.
								//c = c - 1;
								total_count_of_failures = total_count_of_failures + 1; //fresh information.
								total_used_resource = total_used_resource + (use_of_resource_by_write_action + use_of_resource_by_send_action * dist_of_pair[2]) * current_bucket_or_needle[1]; //fresh information.
								total_use_of_resource_by_write_action = total_use_of_resource_by_write_action + current_bucket_or_needle[1];
								total_use_of_resource_by_send_action = total_use_of_resource_by_send_action + current_bucket_or_needle[1] * (use_of_resource_by_send_action * dist_of_pair[2]);
								count_of_local_failure = count_of_local_failure +1;
								
							}	
			            } else {
						
							r = r + 1;
							//c = c - 1;
			                curr_nod[0][1] = 0; // set 0 for the work_status node_j.
							if(gossip_protocol[1][key_of_bucket_or_needle]) {
							gossip_protocol[1][key_of_bucket_or_needle].push([curr_nod[0][0], 22, t + u + 'write_fall']);
							}
                            gossip_protocol[11][key_of_bucket_or_needle][0] = gossip_protocol[11][key_of_bucket_or_needle][0] + 'write_fall : value - ' + t + '_' + u + ' at ' + curr_nod[0][0] + ' and ';
							if(gossip_protocol[10][key_of_bucket_or_needle] && gossip_protocol[10][key_of_bucket_or_needle][nod]) {			
							gossip_protocol[10][key_of_bucket_or_needle][nod] = [gossip_protocol[10][key_of_bucket_or_needle][nod][0]+ ' write_fall--' + t +'_' + u +'-' + current_bucket_or_needle[0] + '--and-', curr_nod[0][5], [-t, u], gossip_protocol[2][key_of_bucket_or_needle][nod][0] + '-pair: write_fall--' + t +'_' + u +'-' + current_bucket_or_needle[0] + '--and-'];
                            }
							gossip_protocol[10][key_of_bucket_or_needle]['uch' + a++] = ['value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [t, u],  gossip_protocol[2][key_of_bucket_or_needle][nod][0] + '-pair: add  --value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' ]; 
                            gossip_protocol[9][key_of_bucket_or_needle][nod] = [gossip_protocol[2][key_of_bucket_or_needle][nod][0] + t +'_' + u +'-' + current_bucket_or_needle[0] + ' no commit -and-', curr_nod[0][5], [-t, u]];
                            curr_nod[0][2][key_of_bucket_or_needle] = t //current_bucket_or_needle, put new Riak objeckt
			                curr_nod[0][3] = curr_nod[0][3] + current_bucket_or_needle[1]; //fresh information.
			                //c = c - 1;
			                total_count_of_failures = total_count_of_failures + 1; //fresh information.
                            count_of_failures_for_write_action = count_of_failures_for_write_action + 1;
                            total_used_resource = total_used_resource + (use_of_resource_by_write_action + use_of_resource_by_send_action * dist_of_pair[2]) * current_bucket_or_needle[1]; //fresh information.
                            total_use_of_resource_by_write_action = total_use_of_resource_by_write_action + current_bucket_or_needle[1];
                            total_use_of_resource_by_send_action = total_use_of_resource_by_send_action + use_of_resource_by_send_action * (current_bucket_or_needle[1] * dist_of_pair[2]);
							 if(gossip_protocol[1][key_of_bucket_or_needle]) {
								    gossip_protocol[1][key_of_bucket_or_needle].push([curr_nod[0][0], 22, t + '_' + u]);
								}
                        }
                    }else{
                        if(gossip_protocol[10][key_of_bucket_or_needle] && gossip_protocol[10][key_of_bucket_or_needle][nod]) {
					    gossip_protocol[10][key_of_bucket_or_needle][nod] = [gossip_protocol[10][key_of_bucket_or_needle][nod][0] +'send_failure - ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and-', curr_nod[0][5], [-t, u], gossip_protocol[2][key_of_bucket_or_needle][nod][0] + '-pair: send_fall--' + t +'_' + u +'-' + current_bucket_or_needle[0] + '--and-'];
                         }
                        gossip_protocol[9][key_of_bucket_or_needle][nod] = [gossip_protocol[2][key_of_bucket_or_needle][nod][0] + t +'_' + u +'-' + current_bucket_or_needle[0] + ' no commit -and-', curr_nod[0][5], [-t, u]];
						gossip_protocol[10][key_of_bucket_or_needle]['uch' + a++] = ['value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [t, u],  gossip_protocol[2][key_of_bucket_or_needle][nod][0] + '-pair: add  --value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' ]; 

                        gossip_protocol[11][key_of_bucket_or_needle][0] = gossip_protocol[11][key_of_bucket_or_needle][0] + 'send_failure : value - ' + t + '_' + u + ' at ' + curr_nod[0][0] + ' and ';   
		                //c = c - 1;
			            total_count_of_failures = total_count_of_failures + 1; //fresh information.
                        count_of_failures_for_send_action = count_of_failures_for_send_action + 1;
				        total_used_resource = total_used_resource + (use_of_resource_by_send_action *dist_of_pair[2]) * current_bucket_or_needle[1];
                        total_use_of_resource_by_send_action = total_use_of_resource_by_send_action + current_bucket_or_needle[1] * (use_of_resource_by_send_action * dist_of_pair[2]);
						 if(gossip_protocol[1][key_of_bucket_or_needle]) {
							gossip_protocol[1][key_of_bucket_or_needle].push([curr_nod[0][0], 23, t + '_' + u]);
								}
                    }
                }else{
                   if(gossip_protocol[10][key_of_bucket_or_needle] && gossip_protocol[10][key_of_bucket_or_needle][nod]) {	 
				    gossip_protocol[10][key_of_bucket_or_needle][nod] = [gossip_protocol[10][key_of_bucket_or_needle][nod][0]+ 'status_fall--' + t +'_' + u +'-' + current_bucket_or_needle[0] + '--and-', curr_nod[0][5], [-t, u], gossip_protocol[2][key_of_bucket_or_needle][nod][0] + '-pair: status_fall--' + t +'_' + u +'-' + current_bucket_or_needle[0] + '--and-'];
                    }
                    gossip_protocol[9][key_of_bucket_or_needle][nod] = [gossip_protocol[2][key_of_bucket_or_needle][nod][0] + t +'_' + u +'-' + current_bucket_or_needle[0] + ' no commit -and-', curr_nod[0][5], [-t, u]]; 
					gossip_protocol[10][key_of_bucket_or_needle]['uch' + a++] = ['value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' , curr_nod[0][5], [t, u],  gossip_protocol[2][key_of_bucket_or_needle][nod][0] + '-pair: add  --value = ' + t +'_' + u +'-' + current_bucket_or_needle[0] + '-and, then: -' ]; 

                    gossip_protocol[11][key_of_bucket_or_needle][0] = gossip_protocol[11][key_of_bucket_or_needle][0] + 'status_fall: value - ' + t + '_' + u + ' at ' + curr_nod[0][0] + ' and '; 
				    if(gossip_protocol[1][key_of_bucket_or_needle]) {
						gossip_protocol[1][key_of_bucket_or_needle].push([curr_nod[0][0], 24, t + '_' + u]);
								}
		            //c = c - 1;
                  }
               
		        }
		           
		
        }
        gossip_protocol[11][key_of_bucket_or_needle][0] = gossip_protocol[11][key_of_bucket_or_needle][0] + '__NEXT--';    
        gossip_protocol[1][key_of_bucket_or_needle].push('change_gossip_protocol: ' + change_gossip_protocol); 
	    if (c < w_value ) { 
				if (gossip_protocol[10][key_of_bucket_or_needle] && gossip_protocol[10][key_of_bucket_or_needle][nod]) { 
			   	gossip_protocol[10][key_of_bucket_or_needle][nod][0] = 	gossip_protocol[10][key_of_bucket_or_needle][nod][0] + 'but no commit(<w-value), and -';
                }					
			count_of_write_failures = count_of_write_failures + 1;
			gossip_protocol[8][key_of_bucket_or_needle] = 1;			  				
                }else{
				    
				    gossip_protocol[2][key_of_bucket_or_needle] = gossip_protocol[9][key_of_bucket_or_needle];
					gossip_protocol[0][key_of_bucket_or_needle].push([t, u]);
                    count_of_right_write_action = count_of_right_write_action + 1;
                     for (node1 in gossip_protocol[10][key_of_bucket_or_needle]) {
                        gossip_protocol[10][key_of_bucket_or_needle][node1][3] = 0;
                        }				    
				      
			    }
		}		
	}			
// iteration's part, read action:
         
    var curr_nod1, gtw_curr_nod1, g1, d1, j1, q, s1, s2, n, b1, c1, nod, buck, gossip_protocol_read, curr_meta_value, reply, time, inform, detail_inform;
    if (current_action === read_action) {
            
        key_of_bucket_or_needle = randomElection(list_of_entering_keys,  uniformDistrOf_n_Elem(list_of_entering_keys.length));
			//gossip_protocol[6][key_of_bucket_or_needle] = [];
			
        current_bucket_or_needle = obj_current[key_of_bucket_or_needle];
		          
        c1 = 0;
	    s1 = 0, s2 = 0;
        q = 0, k = 0;
              		   
		for (buck in gossip_protocol[2][key_of_bucket_or_needle]) {
	        k++;
            for (n = 0; n < cluster.length; n++) {
                        if (cluster[n][0] === buck) {
                            switch (matrix[cluster[n][6]][gtw_curr_nod[0][6]]) {
                                case 1:
                                    L++; 
                                    break;
                                case 2:
                                    M++;
                                    break;
                                case 3:
                                    G++;
                                    break;
                                case 4:
                                    Int++;
                            } 
  
                            if (rem_type) {
                                dist_of_pair = [rem[0][matrix[cluster[n][6]][gtw_curr_nod[0][6]]], rem[1][matrix[cluster[n][6]][gtw_curr_nod[0][6]]], rem[2][matrix[cluster[n][6]][gtw_curr_nod[0][6]]]];
                            }                             
                            cluster[n][5] = Math.max(cluster[n][5], gtw_curr_nod[0][5], t) +  use_time_for_performance_local_action_with_one_cond_unit_of_data * current_bucket_or_needle[4];//time for performance local action.
							max_lag_of_performance_of_read_request = Math.max(max_lag_of_performance_of_read_request, cluster[n][5] - t);
							total_time_of_finish_imitatiion = Math.max(total_time_of_finish_imitatiion,cluster[n][5]);
							gossip_protocol[6][key_of_bucket_or_needle].push([cluster[n][0], cluster[n][5], current_bucket_or_needle[0], t + '_' + u]);
							time = cluster[n][5];
						}		    	 	    
					}
            //dist_of_pair = [rem[0][matrix[curr_nod[0][6]][gtw_curr_nod[0][6]]], rem[1][matrix[curr_nod[0][6]][gtw_curr_nod[0][6]]], rem[2][matrix[curr_nod[0][6]][gtw_curr_nod[0][6]]]]; 	
		    if (randomElection([1, 0], [1 - (p_of_send_action * dist_of_pair[1]) * current_bucket_or_needle[3], (p_of_send_action * dist_of_pair[1]) * current_bucket_or_needle[3]])) {
			    if (randomElection([1, 0], [1 - p_of_read_action * current_bucket_or_needle[3], p_of_read_action * current_bucket_or_needle[3]])) { //read_action finished right.
                    curr_meta_value = gossip_protocol[2][key_of_bucket_or_needle][buck];
				if (curr_meta_value[0]) {
				    s1++;
					
					total_used_resource = total_used_resource + (use_of_resource_by_read_action + use_of_resource_by_send_action * dist_of_pair[2]) * current_bucket_or_needle[1]; //fresh information.
                    total_use_of_resource_by_read_action = total_use_of_resource_by_read_action + use_of_resource_by_read_action * current_bucket_or_needle[1];
                    total_use_of_resource_by_send_action = total_use_of_resource_by_send_action + (use_of_resource_by_send_action * dist_of_pair[2]) * current_bucket_or_needle[1];
					inform = curr_meta_value[0] + 'finish, last at time - ' + curr_meta_value[1].toFixed(3);
					if (curr_meta_value[2][0] === gossip_protocol[3][key_of_bucket_or_needle][0] && curr_meta_value[2][1] === gossip_protocol[3][key_of_bucket_or_needle][1]) {
					    reply = curr_meta_value[0] + 'finish, last at time - ' + curr_meta_value[1].toFixed(3);
						
						
						s2++;
			
						
					}
				}
			
		
		        }else{
				    total_count_of_failures = total_count_of_failures + 1; //fresh information.
                    count_of_failures_for_read_action = count_of_failures_for_read_action + 1;
                    total_used_resource = total_used_resource + (use_of_resource_by_read_action + use_of_resource_by_send_action * dist_of_pair[2]) * current_bucket_or_needle[1]; //fresh information.
                    total_use_of_resource_by_read_action = total_use_of_resource_by_read_action + use_of_resource_by_read_action * current_bucket_or_needle[1];
                    total_use_of_resource_by_send_action = total_use_of_resource_by_send_action + (use_of_resource_by_send_action * dist_of_pair[2]) * current_bucket_or_needle[1];
							
                }        
				}else{    
				    total_count_of_failures = total_count_of_failures + 1; //fresh information.
                        count_of_failures_for_send_action = count_of_failures_for_send_action + 1;
				        total_used_resource = total_used_resource + (use_of_resource_by_send_action * dist_of_pair[2]) *  current_bucket_or_needle[1];
                        total_use_of_resource_by_send_action = total_use_of_resource_by_send_action + (use_of_resource_by_send_action * dist_of_pair[2]) * current_bucket_or_needle[1];
						
                }
//console.log('detail_inform to key ' + key_of_bucket_or_needle + ' is ',inform, '; read action ' + s2 + ' from ' + s1 + ' at step ' + t + '_' + u + '-_- at ' + time )
				
        }

//console.log('inform to key ' + key_of_bucket_or_needle + ' is ',inform, '; read action ' + s2 + ' from ' + s1 + ' at step ' + t + '_' + u + '-_- at ' + time )
		if (s1 < r_value) {
		    count_of_read_failures = count_of_read_failures + 1;// loss of availability.
        }else{
			count_of_right_read_action = count_of_right_read_action + 1;
			if (count_of_iterations_for_algorithm * level_of_intensivity_of_requests < 101) {
console.log('reply to key ' + key_of_bucket_or_needle + ' is ',reply, '; read action ' + s2 + ' from ' + s1 + ' at step ' + t + '_' + u + '-_- at ' + time.toFixed(3) )
            }
			if (s2 < 1 ) {
                
				gossip_protocol[7][key_of_bucket_or_needle] = gossip_protocol[7][key_of_bucket_or_needle] + '_' + t + '_' + u;
				
				count_of_read_lags = count_of_read_lags + 1; //cases of outdated information.
			}
		}
		    reply = undefined;
			time = undefined;
			inform = undefined;
		}
						
	}
    }	                
//input part:   
   
   
   
   
   /*console.log('count_of_right_read_action - ' + count_of_right_read_action,
			'count_of_right_write_action - ' + count_of_right_write_action,
			'count_of_failures_for_send_action - ' + count_of_failures_for_send_action, 'count_of_failures_for_write_action - ' + count_of_failures_for_write_action, 'count_of_failures_for_read_action - ' + count_of_failures_for_read_action,
			'count_of_local_failure - ' + count_of_local_failure,
			'count_of_wrong_read_request - ' + count_of_wrong_read_request,
			'total_use_of_resource_by_write_action - ' + Math.floor(total_use_of_resource_by_write_action), 'total_use_of_resource_by_read_action - ' + Math.floor(total_use_of_resource_by_read_action), 'total_use_of_resource_by_send_action - ' + Math.floor(total_use_of_resource_by_send_action),
			'total_time_of_finish_imitatiion - ' + total_time_of_finish_imitatiion,
    		'total_use_of_resource_by_repair_action - ' + Math.floor(total_use_of_resource_by_repair_action));

   alert(["total_count_of_data - " + Math.floor(total_count_of_data), // in all servers,
	    "total_used_resource - " + Math.floor(total_used_resource),
	    "total_count_of_failures - " + total_count_of_failures,//net's  partitions,  failures of  equipment.
	    "count_of_read_lags(outdated information) - " + count_of_read_lags,//cases of outdated information.
	    "count_of_read_failures (decreasing of the availability) - " + count_of_read_failures,// failures to   requests  for getting data.
	    "count_of_write_failures (decreasing of the availability) - " + count_of_write_failures,
		"max_lag_of_performance_of_read_request - " + max_lag_of_performance_of_read_request.toFixed(3),
		
	    "count_of_read//write_actions - " + count_of_iterations_for_algorithm * level_of_intensivity_of_requests
		]);*/
     console.log(gossip_protocol, 'con_gp_f',total_count_of_data / total_used_resource , (count_of_iterations_for_algorithm * level_of_intensivity_of_requests - (count_of_read_failures +  count_of_write_failures)) / (count_of_iterations_for_algorithm * level_of_intensivity_of_requests), ((count_of_iterations_for_algorithm * level_of_intensivity_of_requests) - count_of_read_lags) / (count_of_iterations_for_algorithm * level_of_intensivity_of_requests), w, v, v1, cluster, gateway_cluster, max_lag_of_performance_for_gateway_nodes, 'L = ' + L, 'M = ' + M, 'G =' + G, 'Int =' + Int,'repair = ' + w);
   
return [(total_count_of_data / total_used_resource).toFixed(3), (((count_of_iterations_for_algorithm * level_of_intensivity_of_requests - (count_of_read_failures +  count_of_write_failures)) / (count_of_iterations_for_algorithm * level_of_intensivity_of_requests)) * 100).toFixed(3),  (((count_of_right_read_action - count_of_read_lags) / count_of_right_read_action) * 100).toFixed(3), total_count_of_data.toPrecision(4), total_used_resource.toPrecision(4), total_count_of_failures, count_of_read_lags, count_of_read_failures, count_of_write_failures, max_lag_of_performance_of_read_request.toFixed(3), count_of_iterations_for_algorithm * level_of_intensivity_of_requests, w]    
}

