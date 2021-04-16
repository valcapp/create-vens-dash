const {
    validName,
} = require('../index');

const sample = [
    ['-my-friend-','my-friend'],
    ['\hello?boy','hello-boy'],
    ['my>favourite%game*','my-favourite-game'],
    ['check|any"mistake','check-any-mistake']
];
for( const [rawName,expected] of sample ){
    test(`validName("${rawName}")\n -> ${expected}\n`, () => {
        expect(validName(rawName)).toBe(expected);
    });
}