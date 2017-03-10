package App::SocialBOM;

# ABSTRACT: turns baubles into trinkets

use Mojolicious::Lite;
use Data::Dumper;
use Time::Moment;
use App::SocialBOM::Url qw(get_new_url);

use feature "say";

my $config = plugin 'Config';

use MongoDB;

my $client = MongoDB->connect('mongodb://localhost');
my $db = $client->get_database($config->{database});


sub db_func {
	my $unknown = shift;
	return $db->get_collection('boms')->find({ url => $unknown});
};


helper post_helper => sub {
	# Add some additional data while POST request depending on specific API method
	my ($self, $hash, $coll_name) = @_;
	given($coll_name) {
		when ("boms") { $hash->{url} = get_new_url(5, \&db_func, "url"); }
	}
	return $hash; 
}; 

#### CRUD API

helper read_all => sub {
	# /api/boms, /api/specs, /api/items etc.
	# CRUD - Read (all)
	my ($self, $coll) = @_;
	my @objects = $db->get_collection($coll)->find()->all;
	return \@objects;
};

helper read_one => sub {
	my ($self, $coll, $id) = @_;
	my $o = $db->get_collection($coll)->find_one({ _id => MongoDB::OID->new(value => $id) });
	return $o;
};

helper create_one => sub {
	my ($self, $coll, $data) = @_;
	my $oid = $db->get_collection($coll)->insert_one($data); # MongoDB::InsertOneResult
	return $oid->inserted_id->to_string;
};

helper update_one => sub {
	my ($self, $coll, $id, $data) = @_;
	my $o = $db->get_collection($coll)->find_one_and_replace( { _id => MongoDB::OID->new(value => $id) }, { '$set' => $data } );
	#my $o = $db->get_collection($coll)->find_one_and_replace( { _id => MongoDB::OID->new(value => $id) });
	return $o;
};

helper delete_one => sub {
	my ($self, $coll, $id) = @_;
	my $o = $db->get_collection($coll)->find_one_and_delete({ _id => MongoDB::OID->new(value => $id) });
	return $o;
};


#### end of CRUD API


#### Business logic


post '/api/:coll' => sub {
  # CRUD - Create
  my $self = shift;
  my $oid = $self->create_one($self->param("coll"), $self->req->json->{data});

  if ($self->param("coll") eq "items") {
  	$self->create_one("bom_has_items", { bom_id => $self->req->json->{extra}->{bom_id}, item_id => $oid })
  };

  if ($self->param("coll") eq "shops") {
  	$self->create_one("item_has_shops", { item_id => $self->req->json->{extra}->{item_id}, shop_id => $oid })
  };

  $self->render(json=>{object_id => $oid});
};

get '/api/:coll' => sub {
	# CRUD - Read (all)
	my $self = shift;
	if (($self->param("coll") eq "items") && ($self->param("bom_id"))) {		# here must a list of objects that cant be retrieved without obligatory extra parametets
	 	warn "Current BOM ID : ".$self->param("bom_id");
		
		my @item_ids = $db->get_collection("bom_has_items")->find({ bom_id => $self->param("bom_id") })->fields({ item_id => 1 })->all;
		my $o = ();
		# warn Dumper \@item_ids;
		for (@item_ids) {
			my $i = $self->read_one("items", $_->{item_id});
			if ($i) {
				push @$o, $i;
			}
		}
		$self->render(json=>$o);
	} elsif (($self->param("coll") eq "shops") && ($self->param("item_id"))) {
			warn "Current Item ID : ".$self->param("item_id");
			my @item_ids = $db->get_collection("item_has_shops")->find({ item_id => $self->param("item_id") })->fields({ shop_id => 1 })->all;
			my $o = ();
			warn Dumper \@item_ids;
			# warn Dumper \@item_ids;
			for (@item_ids) {
				my $i = $self->read_one("shops", $_->{shop_id});
				warn Dumper $i;
				if ($i) {
					push @$o, $i;
				}
			}
		$self->render(json=>$o);
	}
	else {  # retreive all items
		$self->render(json=>$self->read_all($self->param("coll")));
	}
};

get '/api/:coll/:id' => sub {
	# CRUD - Read
	my $self = shift;
	my $o = $self->read_one($self->param("coll"), $self->param("id"));
	
	# return all items in BOM
	if ($self->param("coll") eq "boms") {
		my @item_ids = $db->get_collection("bom_has_items")->find({ bom_id => $self->param("id") })->fields({ item_id => 1 })->all;
		$o->{items} = ();
		# warn Dumper \@item_ids;
		for (@item_ids) {
			push @{$o->{items}}, $self->read_one("items", $_->{item_id});
		}
	};

	$self->render(json => $o);
};

put '/api/:coll/:id' => sub {
	# CRUD - Update
	my $self = shift;
	warn Dumper $self->req->json;
    #my $o = $self->update_one($self->param("coll"), $self->param("id"), $self->req->json);
	$self->render(json => $self->update_one($self->param("coll"), $self->param("id"), $self->req->json) );
};

del '/api/:coll/:id' => sub {
	# CRUD - Delete. Remove item by ID
	my $self = shift;
	$self->render(json=>$self->delete_one( $self->param("coll"), $self->param("id") ) );
};



############################

get '/' => sub {
	my $self = shift;
	$self->render(template => 'index');
};

get '/nurl' => sub {
	my $self = shift;
	$self->render(json=>get_new_url(5, \&db_func, "url"));
};

get '/time' => sub {
	my $self = shift;
	$self->render(json=>Time::Moment->now_utc);
};

get '/debug' => sub {
	my $self = shift;
	$self->render(json => { namespaces => app->commands->namespaces });
};


get '/rates' => sub {
  my $self = shift;
  my $o = $self->ua->get('https://www.tinkoff.ru/api/v1/currency_rates/')->res->json->{payload}->{rates};
  my @a = grep { $_->{fromCurrency}->{name} eq "USD" && $_->{toCurrency}->{name} eq "RUB" && $_->{category} eq "DebitCardsTransfers" } @$o;
  my $usd = $a[0]->{sell};
  my @b = grep { $_->{fromCurrency}->{name} eq "EUR" && $_->{toCurrency}->{name} eq "RUB" && $_->{category} eq "DebitCardsTransfers" } @$o;
  my $eur = $b[0]->{sell};
  $self->render(json => {"USD" => $usd, "EUR" => $eur});
};


push @{app->commands->namespaces}, 'App::SocialBOM::Command::cmd1';
app->start;

1;