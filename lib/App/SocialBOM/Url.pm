package App::SocialBOM::Url;

use common::sense;
use Exporter qw(import);
our @EXPORT_OK = qw(get_new_url);

sub get_new_url {
	my ($l, $db_function, $field_name) = @_;
	# $db_function - ссылка или id функции которая возвращает хэш из бд
	my $url = "";
	my $count;
	while ( checkUrl($url, $db_function, $field_name) == 0 ) {
		$url = gen_shorturl($l);
		$count++;
		if( ($count % 20) == 0){
			$l++;
		}
		elsif($count > 100){
			return -1;			# error
		}
	}
	return $url;
}


sub gen_shorturl {
	my $short_url_length = shift;
	my $short_url = "";
	my @randtable = qw(0 1 2 3 4 5 6 7 8 9 a b c d e f g h i j k l m n o p q r s t u v w x y z A B C D E F G H I J K L M N O P Q R S T U V W X Y Z);
	my $count=0;
	foreach(1 .. $short_url_length) {
		$short_url .= $randtable[int(rand(62))];
	}
	return $short_url;
};

sub checkUrl {
	my ($url_to_check, $db_function, $key) = @_;   # hash, key which contain url 
	my $db = $db_function->($url_to_check);
	# Return false if DB has this url
	# 0 - database has this url, validation false
	# 1 - database haven't this url, valudation true
	if (($db->{$key} eq $url_to_check) || ($url_to_check eq "")) {
		return 0;  # false
	} else {
		return 1;
	}
};