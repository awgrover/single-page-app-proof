# App name, i.e the single page
app := proof

# override to 'development' for more debug'ability
ifndef CONTEXT
CONTEXT := production
endif

pouchmainvers := 5.3
pouchrelvers := 0
pouchvers := $(pouchmainvers).$(pouchrelvers)


ifeq ($(CONTEXT), production)
jssize := min
else
jssize := max
endif

.PHONY : all
all : pouchdb-$(pouchvers).$(jssize).js pouchdb-$(pouchmainvers).js jquery-2.2.min.js

$(app).zip : all build/$(app)/clean build/$(app)/pouchdb-$(pouchmainvers).js build/$(app)/$(app).html build/$(app)/app.js
	cd build &&\
	zip ../$(app).zip $(app)/* 

.PHONY : pouchdb-version
pouchdb-version :
	@ echo $(pouchvers)

.PHONY : debug
debug :
	@ echo CONTEXT '$(CONTEXT)'
	@ echo jssize '$(jssize)'

# Force relink
.PHONY : pouchdb-$(pouchmainvers).js
pouchdb-$(pouchmainvers).js : 
	ln -f -s pouchdb-$(pouchvers).$(jssize).js $@

pouchdb-$(pouchvers).min.js : 
	wget -O $@ https://cdn.jsdelivr.net/pouchdb/$(pouchvers)/pouchdb.min.js

pouchdb-$(pouchvers).max.js : 
	wget -O $@ https://cdn.jsdelivr.net/pouchdb/$(pouchvers)/pouchdb.js
	# wget -O $@ https://github.com/pouchdb/pouchdb/releases/download/$(pouchvers)/pouchdb-$(pouchvers).js

jquery-2.2.min.js : 
	wget http://code.jquery.com/jquery-2.2.1.min.js && \
	ln -s jquery-2.2.1.min.js jquery-2.2.min.js

.PHONY : build/$(app)/clean
build/$(app)/clean :
	rm -rf build/$(app)
	mkdir -p build/$(app)

build/$(app) :
	mkdir -p $@

build/$(app)/$(app).html : $(app).html build/$(app)
	cp $< $@

build/$(app)/app.js : app.js build/$(app)
	cp $< $@

build/$(app)/pouchdb-$(pouchmainvers).js : pouchdb-$(pouchvers).min.js
	cp $< $@

# First time setup, use ./couchdb-local hereafter
couchdb-local :
	[ -e couchdb-local ] || (ln -s lib/couchdb-local . && chmod ug+x lib/couchdb-local)
	./couchdb-local
	@echo to stop, use: ./couchdb-local kill
	
