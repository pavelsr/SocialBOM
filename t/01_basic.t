#!/usr/bin/env perl

#use Test::More tests => 6;

use Test::More;
use Test::Mojo;
use Data::Dumper;

require App::SocialBOM;
 
my $t = Test::Mojo->new;

# Create new bom, one new item in it, update it's names and delete all

# New bom
$t->post_ok('/api/boms' => json => { data => {name => 'Test Bom', desc => "This is a test BOM" }} );

# # Mojo::Message::Response result we can get via t->tx->res
my $b = $t->tx->res->json->{object_id};

# completely update the object data
$t->put_ok('/api/boms/'.$b => json => { name => 'Test Bom modified', desc => "This is a test BOM" } );
$t->get_ok('/api/boms/'.$b);


$t->post_ok('/api/items' => json => { data => {name => 'Item 1' }, extra => { bom_id => $o } });
my $i = $t->tx->res->json->{object_id};
$t->get_ok('/api/items/'.$i);

$t->get_ok('/api/bom_has_items/')->json_has({bom_id => $b, item_id => $i});

# $t->delete_ok('/api/boms/'.$o);

done_testing();