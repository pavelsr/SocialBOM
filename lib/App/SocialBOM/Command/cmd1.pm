package App::SocialBOM::Command::cmd1;

# ABSTRACT: adding command for easy deployment with hypnotoad

use Mojo::Base 'Mojolicious::Command';

has description => 'Spy on application';
has usage       => "Usage: APPLICATION cmd1 [TARGET]\n";

sub run {
  my ($self, @args) = @_;

  # Leak secret passphrases
  if ($args[0] eq 'secrets') { say for @{$self->app->secrets} }

  # Leak mode
  elsif ($args[0] eq 'mode') { say $self->app->mode }
}

1;