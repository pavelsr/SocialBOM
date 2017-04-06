package App::SocialBOM::Command::cmd1;

# ABSTRACT: adding command for easy deployment with hypnotoad

use Mojo::Base 'Mojolicious::Command';
use Data::Dumper;

has description => 'Spy on application'; # Short description
has usage       => sub { shift->extract_usage }; # Usage message from SYNOPSIS

sub run {
  my ($self, @args) = @_;
  warn Dumper $self->rel_file;

  # Leak secret passphrases
  if ($args[0] eq 'secrets') { say for @{$self->app->secrets} }

  # Leak mode
  elsif ($args[0] eq 'mode') { say $self->app->mode }
}

=head1 SYNOPSIS

  Usage: APPLICATION cmd1 [TARGET]

  Options:
    -s, --something   Does something

=cut

1;