
var diff = require('..');
var e = require('expect.js');

describe('mongo-diff', function(){

  describe('auto', function(){
    it('should work', function(){
      e(diff('a', 'b')).to.eql([['set', 'b']]);
    });
  });

  describe('val', function(){
    it('should work', function(){
      e(diff.val('a', 'b')).to.eql([['set', 'b']]);
    });

    it('should ignore same value', function(){
      e(diff.val({}, {})).to.eql([]);
    });

    it('should do unset', function(){
      e(diff.val('a', null)).to.eql([['unset', '1']]);
    });
  });

  describe('ordered_set', function(){
    it('should work', function(){
      e(diff.ordered_set([1], [2])).to.eql([
        ['pull', 1],
        ['push', 2]
      ]);
    });

    it('should work with empty', function(){
      e(diff.ordered_set([], [])).to.eql([]);
    });

    it('should pull existing ones', function(){
      e(diff.ordered_set([1,2,3,4], [4])).to.eql([
        ['pull', 1],
        ['pull', 2],
        ['pull', 3]
      ]);
    });

    it('should pull interleaved', function(){
      e(diff.ordered_set([1,2,3], [1, 3, 5, 6])).to.eql([
        ['pull', 2],
        ['push', 5],
        ['push', 6]
      ]);
    });

    it('should throw on invalid sets', function(){
      e(function(){
        diff.ordered_set([1,2,3], [3,2,1]);
      }).to.throwError();
    });
  });

});
