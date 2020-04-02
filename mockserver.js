'use strict';
require('express')()
.use(require('express').static('./docs'))
.use(require('serve-index')('./docs', {icons: true}))
.listen(process.env.PORT || 3000);

console.log("start mock server : 3000");