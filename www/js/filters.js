module.filter('bucket', function(){
         return function(hash, pattern){
                 if(!hash)
                         return hash;
                 var r = 'https://dn-nuoio.qbox.me/' + hash;                                                                       
                 r += (pattern)?('-'+pattern):'';
                 return r;
         };
 })

