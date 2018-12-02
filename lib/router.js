let Router = require('router');
let router = Router({});

router.get('/', function (req, res) {
    res.end('Hello World!')
});

module.exports = router;
